// View Transitions API 类型声明
interface ViewTransition {
  ready: Promise<void>
  finished: Promise<void>
  updateCallbackDone: Promise<void>
  skipTransition(): void
}

interface Document {
  startViewTransition?(callback?: () => void | Promise<void>): ViewTransition
}
