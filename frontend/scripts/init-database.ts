import { initializeInMemoryStorage } from "../lib/db-service"
import { sampleUsers, sampleRiskScores, sampleMeetings, sampleMeetingParticipants } from "../lib/sample-data"

async function initDatabase() {
  console.log("Initializing in-memory database...")

  try {
    // Initialize in-memory storage with sample data
    await initializeInMemoryStorage(sampleUsers, sampleRiskScores, sampleMeetings, sampleMeetingParticipants)

    console.log("In-memory database initialized successfully")
  } catch (error) {
    console.error("Error initializing in-memory database:", error)
    throw error
  }
}

// Check if this script is being run directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log("Database initialization script completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Database initialization script failed:", error)
      process.exit(1)
    })
}

export { initDatabase }
