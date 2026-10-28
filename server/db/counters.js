import Counter from "../models/Counter.js";

export async function nextId(counterName) {
    const counter = await Counter.findByIdAndUpdate(
        counterName,
        { $inc: { sequence: 1 } },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
    );

    if (!counter) {
        throw new Error(`Could not allocate an id from the "${counterName}" sequence.`);
    }

    return counter.sequence;
}
