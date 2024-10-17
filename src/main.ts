import * as T from "effect-ts"
import { TaggedEnum, Member } from "effect-ts/Data/TaggedEnum"
import { pipe } from "effect-ts/Function"

// Define the RemoteData type using TaggedEnum
export const RemoteData = TaggedEnum<{
  // Initial state before data fetching
  NotAsked: Member<void>
  // Data fetching is in progress
  Pending: Member<void>
  // Data fetching succeeded
  Success: Member<{ data: unknown }>
  // Data fetching failed
  Failure: Member<{ error: unknown }>
}>()

// Type aliases for convenience
export type RemoteData<E, A> =
  | TaggedEnum.Tagged<"NotAsked", void>
  | TaggedEnum.Tagged<"Pending", void>
  | TaggedEnum.Tagged<"Success", { data: A }>
  | TaggedEnum.Tagged<"Failure", { error: E }>

// Helper functions to create RemoteData instances
export const notAsked = RemoteData.of.NotAsked
export const pending = RemoteData.of.Pending
export const success = <A>(data: A): RemoteData<never, A> =>
  RemoteData.of.Success({ data })
export const failure = <E>(error: E): RemoteData<E, never> =>
  RemoteData.of.Failure({ error })

// Example usage
interface User {
  id: number
  name: string
}

const fetchData = (): T.IO<Error, User> => {
  // Simulate an asynchronous data fetching operation
  return T.effectAsync<unknown, Error, User>((cb) => {
    setTimeout(() => {
      const success = Math.random() < 0.5
      if (success) {
        cb(T.succeed({ id: 1, name: "John Doe" }))
      } else {
        cb(T.fail(new Error("Failed to fetch data")))
      }
    }, 1000)
  })
}

const program = pipe(
  fetchData(),
  T.map(success),
  T.catchAll(failure),
  T.map((data) => {
    // Use a fold to handle different states of RemoteData
    return pipe(
      data,
      RemoteData.fold({
        NotAsked: () => "Data not requested yet",
        Pending: () => "Loading data...",
        Success: ({ data }) => `User: ${data.name}`,
        Failure: ({ error }) => `Error: ${error.message}`,
      }),
    )
  }),
)

// Run the program
T.runPromise(program).then(console.log)