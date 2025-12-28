import { db } from "./firebase";
import { doc, setDoc, collection } from "firebase/firestore";

const workoutData = {
  versionA: {
    days: {
      1: {
        title: "Push (Chest, Shoulders, Triceps)",
        exercises: [
          { name: "Decline Push-ups", sets: "4", reps: "8–12", tempo: "3-1-1", rest: "90s", notes: "Feet on chair", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80" },
          { name: "DB Floor Press", sets: "4", reps: "10–12", tempo: "2-1-2", rest: "90s", notes: "Squeeze chest", image: "https://images.unsplash.com/photo-1581009146145-b5ef03a7401f?auto=format&fit=crop&w=800&q=80" },
          { name: "Chair Dips", sets: "3", reps: "8–12", tempo: "3-1-1", rest: "120s", notes: "Lean forward", image: "https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&w=800&q=80" },
          { name: "DB Shoulder Press", sets: "3", reps: "8–10", tempo: "2-1-2", rest: "120s", notes: "Seated if needed", image: "https://images.unsplash.com/photo-1541534741688-6078c6bd35a5?auto=format&fit=crop&w=800&q=80" },
          { name: "DB Lateral Raise", sets: "3", reps: "12–15", tempo: "2-1-3", rest: "60s", notes: "Light & slow", image: "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?auto=format&fit=crop&w=800&q=80" },
        ]
      },
      2: {
        title: "Pull (Back, Biceps)",
        exercises: [
          { name: "Pull-ups", sets: "5", reps: "5–8", tempo: "2-1-3", rest: "150s", notes: "Full hang", image: "https://images.unsplash.com/photo-1598971639058-aba7c12af937?auto=format&fit=crop&w=800&q=80" },
          { name: "Negative Pull-ups", sets: "3", reps: "3", tempo: "0-0-6", rest: "150s", notes: "Slow lower", image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80" },
          { name: "One-arm DB Row", sets: "4", reps: "10–12", tempo: "2-1-2", rest: "90s", notes: "Each arm", image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80" },
          { name: "DB Hammer Curl", sets: "3", reps: "10–12", tempo: "2-1-2", rest: "60s", notes: "Neutral grip", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80" },
          { name: "DB Concentration Curl", sets: "2", reps: "12–15", tempo: "2-1-3", rest: "60s", notes: "Strict form", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80" },
        ]
      },
      3: { title: "Rest", exercises: [] },
      4: {
        title: "Legs + Core",
        exercises: [
          { name: "Goblet Squat", sets: "4", reps: "12–15", tempo: "3-1-1", rest: "120s", notes: "Hold DB", image: "https://images.unsplash.com/photo-1574673130244-c707e9d8352b?auto=format&fit=crop&w=800&q=80" },
          { name: "DB Bulgarian Split Squat", sets: "3", reps: "8–10", tempo: "3-1-1", rest: "120s", notes: "Each leg", image: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=800&q=80" },
          { name: "DB Romanian Deadlift", sets: "4", reps: "10–12", tempo: "3-1-1", rest: "120s", notes: "Hip hinge", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" },
          { name: "Standing Calf Raise", sets: "4", reps: "15–20", tempo: "2-1-2", rest: "60s", notes: "Pause top", image: "https://images.unsplash.com/photo-1541534741688-6078c6bd35a5?auto=format&fit=crop&w=800&q=80" },
          { name: "Plank", sets: "3", reps: "45–60s", tempo: "-", rest: "60s", notes: "Tight core", image: "https://images.unsplash.com/photo-1566241477600-ac026ad43874?auto=format&fit=crop&w=800&q=80" },
        ]
      },
      5: {
        title: "Upper Body Hypertrophy",
        exercises: [
          { name: "Push-ups", sets: "3", reps: "15", tempo: "3-1-1", rest: "60s", notes: "Pump focus", image: "https://images.unsplash.com/photo-1598971639058-aba7c12af937?auto=format&fit=crop&w=800&q=80" },
          { name: "Pull-ups", sets: "3", reps: "Max-1", tempo: "2-1-3", rest: "120s", notes: "Controlled", image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80" },
          { name: "DB Shoulder Press", sets: "3", reps: "12", tempo: "2-1-2", rest: "90s", notes: "Strict", image: "https://images.unsplash.com/photo-1541534741688-6078c6bd35a5?auto=format&fit=crop&w=800&q=80" },
          { name: "DB Row", sets: "3", reps: "12", tempo: "2-1-2", rest: "90s", notes: "Both arms", image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80" },
          { name: "DB Curl + Triceps Ext", sets: "3", reps: "12–15", tempo: "2-1-2", rest: "60s", notes: "Superset", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80" },
        ]
      },
      6: { title: "Rest", exercises: [] },
      7: { title: "Rest", exercises: [] },
    }
  },
  versionB: {
    days: {
      1: {
        title: "Push Workout",
        exercises: [
          { name: "Decline Push-ups", sets: "4", reps: "8–12", tempo: "3 sec down", rest: "90–150s", notes: "Feet on chair", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80" },
          { name: "Dumbbell Floor Press", sets: "4", reps: "10–12", tempo: "Slow", rest: "90–150s", notes: "6 kg", image: "https://images.unsplash.com/photo-1581009146145-b5ef03a7401f?auto=format&fit=crop&w=800&q=80" },
          { name: "Chair Dips", sets: "3", reps: "8–12", tempo: "Slow", rest: "90–150s", notes: "", image: "https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&w=800&q=80" },
          { name: "Dumbbell Shoulder Press", sets: "3", reps: "8–10", tempo: "Slow", rest: "90–150s", notes: "", image: "https://images.unsplash.com/photo-1541534741688-6078c6bd35a5?auto=format&fit=crop&w=800&q=80" },
          { name: "Dumbbell Lateral Raises", sets: "3", reps: "12–15", tempo: "Slow", rest: "90–150s", notes: "", image: "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?auto=format&fit=crop&w=800&q=80" },
        ]
      },
      2: {
        title: "Pull Workout",
        exercises: [
          { name: "Pull-ups", sets: "5", reps: "5–8", tempo: "Slow", rest: "90–150s", notes: "", image: "https://images.unsplash.com/photo-1598971639058-aba7c12af937?auto=format&fit=crop&w=800&q=80" },
          { name: "Slow Negative Pull-ups", sets: "3", reps: "3", tempo: "5–6 sec lowering", rest: "90–150s", notes: "", image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80" },
          { name: "One-arm Dumbbell Row", sets: "4", reps: "10–12", tempo: "Slow", rest: "90–150s", notes: "6 kg, per side", image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80" },
          { name: "Dumbbell Hammer Curls", sets: "3", reps: "10–12", tempo: "Slow", rest: "90–150s", notes: "", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80" },
          { name: "Dumbbell Concentration Curls", sets: "2", reps: "12–15", tempo: "Slow", rest: "90–150s", notes: "", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80" },
        ]
      },
      3: { title: "Rest", exercises: [] },
      4: {
        title: "Legs + Core",
        exercises: [
          { name: "Goblet Squats", sets: "4", reps: "12–15", tempo: "3 sec down", rest: "90–150s", notes: "DB", image: "https://images.unsplash.com/photo-1574673130244-c707e9d8352b?auto=format&fit=crop&w=800&q=80" },
          { name: "Bulgarian Split Squats", sets: "3", reps: "8–10", tempo: "Slow", rest: "90–150s", notes: "chair, per leg", image: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=800&q=80" },
          { name: "Dumbbell Romanian Deadlift", sets: "4", reps: "10–12", tempo: "Slow", rest: "90–150s", notes: "", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" },
          { name: "Standing Calf Raises", sets: "4", reps: "15–20", tempo: "Slow", rest: "90–150s", notes: "DBs", image: "https://images.unsplash.com/photo-1541534741688-6078c6bd35a5?auto=format&fit=crop&w=800&q=80" },
          { name: "Plank", sets: "3", reps: "45–60s", tempo: "-", rest: "90–150s", notes: "", image: "https://images.unsplash.com/photo-1566241477600-ac026ad43874?auto=format&fit=crop&w=800&q=80" },
        ]
      },
      5: {
        title: "Upper Body Hypertrophy",
        exercises: [
          { name: "Push-ups", sets: "3", reps: "15", tempo: "slow", rest: "90–150s", notes: "", image: "https://images.unsplash.com/photo-1598971639058-aba7c12af937?auto=format&fit=crop&w=800&q=80" },
          { name: "Pull-ups", sets: "3", reps: "max-1", tempo: "slow", rest: "90–150s", notes: "", image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80" },
          { name: "Dumbbell Shoulder Press", sets: "3", reps: "12", tempo: "slow", rest: "90–150s", notes: "", image: "https://images.unsplash.com/photo-1541534741688-6078c6bd35a5?auto=format&fit=crop&w=800&q=80" },
          { name: "Dumbbell Rows", sets: "3", reps: "12", tempo: "slow", rest: "90–150s", notes: "", image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80" },
          { name: "Superset - DB Curls + Overhead Triceps Extension", sets: "3", reps: "12–15", tempo: "slow", rest: "90–150s", notes: "each", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80" },
        ]
      },
      6: { title: "Rest", exercises: [] },
      7: { title: "Rest", exercises: [] },
    }
  }
};

export const seedWorkoutData = async () => {
  try {
    const workoutPlansCol = collection(db, "workoutPlans");
    const weeklyPlanDoc = doc(workoutPlansCol, "weeklyPlan");
    
    // We can't set nested collections directly with setDoc easily in one go if they are deep, 
    // but we can structure them as maps or subcollections.
    // The requirement says: workoutPlans / weeklyPlan / versionA|versionB / days / 1–7
    
    // Let's use versionA and versionB as fields in weeklyPlan for simplicity, 
    // or as separate documents in a subcollection.
    
    const versionACol = collection(weeklyPlanDoc, "versionA");
    const versionBCol = collection(weeklyPlanDoc, "versionB");

    for (const [day, data] of Object.entries(workoutData.versionA.days)) {
      await setDoc(doc(versionACol, day), data);
    }
    for (const [day, data] of Object.entries(workoutData.versionB.days)) {
      await setDoc(doc(versionBCol, day), data);
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};
