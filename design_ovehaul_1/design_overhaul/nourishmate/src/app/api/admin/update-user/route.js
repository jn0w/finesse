import { MongoClient, ObjectId } from "mongodb";

const uri =
  "mongodb+srv://jakub:verysecurepass@cluster0.6z2wd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

export async function POST(request) {
  try {
    const { userId, name, email, activityLevel, goal } = await request.json();
    await client.connect();
    const db = client.db("testDatabase");

    const result = await db.collection("userCollection").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: { name, email, activityLevel, goal },
      }
    );

    if (result.modifiedCount === 0) {
      return new Response(JSON.stringify({ message: "No changes made." }), {
        status: 400,
      });
    }

    return new Response(
      JSON.stringify({ message: "User updated successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response("Error updating user", { status: 500 });
  } finally {
    await client.close();
  }
}
