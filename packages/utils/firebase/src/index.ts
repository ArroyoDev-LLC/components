import admin from 'firebase-admin'
import type functions from 'firebase-functions'

export type FbDocumentChange =
	functions.Change<functions.firestore.DocumentSnapshot>

export type FbTimestamp = FirebaseFirestore.Timestamp

export const TimestampFields = {
	createdAt: 'created_at',
	updatedAt: 'updated_at',
	createdBy: 'created_by',
	updatedBy: 'updated_by',
}

export const BaseFields = {
	docId: 'doc_id',
	...TimestampFields,
}

/**
 * Checks if the operation is a create operation.
 */
export const isCreateOp = (change: FbDocumentChange) =>
	change.after.exists && !change.before.exists

/**
 * Checks if the operation is an update operation.
 */
export const isUpdateOp = (change: FbDocumentChange) =>
	change.before.exists && change.after.exists

/**
 * Checks if the timestamps were updated.
 */
export const isTimestampUpdateOp = (change: FbDocumentChange) => {
	const before = change.before
	const after = change.after
	const createdAtBefore = before.get(BaseFields.createdAt) as FbTimestamp
	const createdAtAfter = after.get(BaseFields.createdAt) as FbTimestamp
	const updatedAtBefore = before.get(BaseFields.updatedAt) as FbTimestamp
	const updatedAtAfter = after.get(BaseFields.updatedAt) as FbTimestamp
	return (
		(!!createdAtAfter && !createdAtAfter.isEqual(createdAtBefore)) ||
		(!!updatedAtAfter && !updatedAtAfter.isEqual(updatedAtBefore))
	)
}

/**
 * Handles document write operations for both creation and updates.
 */
export const handleDocumentWrite = async (
	change: FbDocumentChange,
	context: functions.EventContext,
) => {
	const now = admin.firestore.FieldValue.serverTimestamp()
	const docId = context.params.docId
	const documentPath = context.resource.name // Get the path of the document affected

	if (isCreateOp(change)) {
		console.info(`Creating document at ${documentPath}`, { documentPath })
		const update = {
			[BaseFields.docId]: docId,
			[BaseFields.createdAt]: now,
			[BaseFields.updatedAt]: now,
		}
		return change.after.ref
			.update(update)
			.then(() =>
				console.info(`Document created with timestamps at ${documentPath}`, {
					documentPath,
					update,
				}),
			)
			.catch((error: Error) =>
				console.error(
					`Error creating document at ${documentPath}: ${error.message}`,
					{
						documentPath,
						error,
					},
				),
			)
	}

	if (isUpdateOp(change) && !isTimestampUpdateOp(change)) {
		console.info(`Updating document at ${documentPath}`, { documentPath })
		const update = {
			[BaseFields.updatedAt]: now,
		}
		return change.after.ref
			.update(update)
			.then(() =>
				console.info(`Document updated with timestamps at ${documentPath}`, {
					documentPath,
					update,
				}),
			)
			.catch((error: Error) =>
				console.error(
					`Error updating document at ${documentPath}: ${error.message}`,
					{
						documentPath,
						error,
					},
				),
			)
	}

	// Log if the function is triggered but no action is taken
	console.info(`No timestamp update required for document at ${documentPath}`, {
		documentPath,
		reason:
			'Either deletion, only timestamp fields updated, or not an update operation.',
	})
	return null
}
