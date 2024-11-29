// 在您的插件中定义外部 Vim 扩展的 API 接口
export interface ISneakStartEvent {
  keysPressed: string[];
}

export interface ISneakEndEvent {
  line: number;
  searchString: string;
}

export interface VimAPI {
  onSneakForwardStart: (callback: (event: ISneakStartEvent) => void) => { dispose(): void };
  onSneakForwardEnd: (callback: (event: ISneakEndEvent) => void) => { dispose(): void };
}