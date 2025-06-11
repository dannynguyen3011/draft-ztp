import { initializeInMemoryStorage } from "../lib/db-service"
import { sampleUsers, sampleRiskScores, sampleMeetings, sampleMeetingParticipants } from "../lib/sample-data"

export async function seedDatabase() {
  try {
    console.log("Seeding in-memory database...")

    // Initialize in-memory storage with sample data
    await initializeInMemoryStorage(sampleUsers, sampleRiskScores, sampleMeetings, sampleMeetingParticipants)

    console.log("Database seeded successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  }
}

// Check if this script is being run directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Database seed script completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Database seed script failed:", error)
      process.exit(1)
    })
}
