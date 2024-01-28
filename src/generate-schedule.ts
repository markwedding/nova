import { Config, Context, Effect, Layer, Secret, pipe } from 'effect';
import { Client as NotionClient } from '@notionhq/client';
import { NotionError } from './types';

const NotionClientService = Context.Tag<NotionClient>();

const program = Effect.gen(function* (_) {
  const notionClient = yield* _(NotionClientService);
  const databaseId = yield* _(Config.string('NOTION_SCHEDULE_DB_ID'));

  const response = yield* _(
    Effect.tryPromise({
      try: () =>
        notionClient.databases.query({
          database_id: databaseId,
          filter: {
            or: [
              {
                property: 'day type',
                select: {
                  equals: 'monday',
                },
              },
              {
                property: 'day type',
                select: {
                  equals: 'tuesday',
                },
              },
              {
                property: 'day type',
                select: {
                  equals: 'wednesday',
                },
              },
              {
                property: 'day type',
                select: {
                  equals: 'thursday',
                },
              },
              {
                property: 'day type',
                select: {
                  equals: 'friday',
                },
              },
              {
                property: 'day type',
                select: {
                  equals: 'saturday',
                },
              },
              {
                property: 'day type',
                select: {
                  equals: 'sunday',
                },
              },
            ],
          },
        }),
      catch: (cause) => new NotionError({ cause }),
    }),
  );

  yield* _(
    Effect.tryPromise({
      try: () =>
        Bun.write('./temp/response.json', JSON.stringify(response, null, 2)),
      catch: () => new Error('Error writing file'),
    }),
  );
});

async function main() {
  const notionLayer = Layer.effect(
    NotionClientService,
    Effect.gen(function* (_) {
      const notionAuthTokenSecret = yield* _(
        Config.secret('NOTION_AUTH_TOKEN'),
      );

      return new NotionClient({ auth: Secret.value(notionAuthTokenSecret) });
    }),
  );

  try {
    await pipe(program, Effect.provide(notionLayer), Effect.runPromise);
  } catch (error) {
    console.error(error);
  }
}

void main();
