import { Component, type ReactNode } from "react";
import { Platform, View } from "react-native";

type Position = { element: HTMLElement; top: number; left: number } | null;
type Props = { revision: string; scope: string; children: ReactNode };

/** Preserve the page offset across a completion commit, before the browser paints. */
export class GrammarViewport extends Component<Props, object, Position> {
  private root: HTMLElement | null = null;
  private scroller: HTMLElement | null = null;
  private previousAnchor = "";

  componentDidMount() {
    this.scroller =
      this.root?.closest<HTMLElement>('[data-testid="learning-page-scroll"]') ??
      null;
    if (this.scroller) {
      this.previousAnchor = this.scroller.style.overflowAnchor;
      // Browser anchoring must not follow a keyed card to the end of the list.
      this.scroller.style.overflowAnchor = "none";
    }
  }

  getSnapshotBeforeUpdate(previous: Props): Position {
    if (
      !this.scroller ||
      previous.revision === this.props.revision ||
      previous.scope !== this.props.scope
    )
      return null;
    return {
      element: this.scroller,
      top: this.scroller.scrollTop,
      left: this.scroller.scrollLeft,
    };
  }

  componentDidUpdate(_previous: Props, _state: object, position: Position) {
    if (position) {
      position.element.scrollTop = position.top;
      position.element.scrollLeft = position.left;
    }
  }

  componentWillUnmount() {
    if (this.scroller) this.scroller.style.overflowAnchor = this.previousAnchor;
  }

  restoreFocus() {
    if (!this.root || !this.scroller) return;
    const viewport = this.scroller.getBoundingClientRect();
    const buttons = [
      ...this.root.querySelectorAll<HTMLElement>('[role="button"]'),
    ];
    const target =
      buttons.find((button) => {
        if (button.getAttribute("aria-label") !== "Open lesson") return false;
        const bounds = button.getBoundingClientRect();
        return bounds.top >= viewport.top && bounds.bottom <= viewport.bottom;
      }) ?? this.root;
    if (target === this.root) target.tabIndex = -1;
    // The original opener was replaced on completion. Return focus locally,
    // without scrolling to a reordered card or to an off-screen fallback.
    target.focus({ preventScroll: true });
  }

  render() {
    return (
      <View
        ref={(node) => {
          this.root =
            Platform.OS === "web" ? (node as unknown as HTMLElement) : null;
        }}
      >
        {this.props.children}
      </View>
    );
  }
}
