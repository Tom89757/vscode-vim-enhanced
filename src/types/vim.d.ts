import { Event, Position } from "vscode";

// 在您的插件中定义外部 Vim 扩展的 API 接口
export interface ISneakStartEvent {
  keysPressed: string[];
}

export interface ISneakEndEvent {
  line: number;
  searchString: string;
}

export interface IFindStartEvent {
  keysPressed: string[];
}

export interface IFindEndEvent {
  position: Position;
  searchChar: string;
}

export declare enum Mode {
  Normal,
  Insert,
  Visual,
  VisualBlock,
  VisualLine,
  SearchInProgressMode,
  CommandlineInProgress,
  Replace,
  EasyMotionMode,
  EasyMotionInputMode,
  SurroundInputMode,
  OperatorPendingMode,
  Disabled,
}

export interface VimAPI {
  onSneakForwardStart: (callback: (event: ISneakStartEvent) => void) => {
    dispose(): void;
  };
  onSneakForwardEnd: (callback: (event: ISneakEndEvent) => void) => {
    dispose(): void;
  };

  onSneakBackwardStart: (callback: (event: ISneakStartEvent) => void) => {
    dispose(): void;
  };
  onSneakBackwardEnd: (callback: (event: ISneakEndEvent) => void) => {
    dispose(): void;
  };
  onFindForwardStart: (callback: (event: IFindStartEvent) => void) => {
    dispose(): void;
  };
  onFindForwardEnd: (callback: (event: IFindEndEvent) => void) => {
    dispose(): void;
  };
  onFindBackwardStart: (callback: (event: IFindStartEvent) => void) => {
    dispose(): void;
  };
  onFindBackwardEnd: (callback: (event: IFindEndEvent) => void) => {
    dispose(): void;
  };
  onModeChanged: (callback: (event: Mode) => void) => {
    dispose(): void;
  };

}
