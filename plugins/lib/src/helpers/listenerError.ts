import { LunaPlugin, type Tracer } from "@luna/core";

/**
 * Build an onError handler for an event emitter.
 *
 * registerEmitter hands the same onError to every listener and never says which one threw, so a
 * plugin's broken listener used to be recorded against whichever module owns the emitter. That made
 * a third party plugin mark a core module as failed. The stack still names the bundle that threw,
 * so attribute by that and only fall back to the emitting module when no frame belongs to a plugin.
 */
export const listenerError =
	(trace: Tracer, context: string) =>
	(err: unknown): void => {
		const message = (<Error>err)?.message ?? String(err);
		const culprit = LunaPlugin.fromStack((<Error>err)?.stack);
		if (culprit !== undefined) {
			// A runtime fault in someone's listener, not a failure to load
			culprit.reportRuntimeError(`${context}: ${message}`);
			console.error(`[${culprit.name}] ${context}:`, err);
			return;
		}
		trace.err.withContext(context)(err);
	};
