import { db } from "./firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import { EXERCISE_DETAILS } from "./exercises-db";

const workoutData = {
    versionA: {
      days: {
        1: {
          title: "Push (Chest, Shoulders, Triceps)",
          exercises: [
            { name: "Decline Push-ups", sets: "4", reps: "8–12", tempo: "4s Negative", rest: "90s", notes: "Feet on chair. Focus on slow descent.", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Floor Press", sets: "4", reps: "10–12", tempo: "3s Negative", rest: "90s", notes: "Squeeze chest at top.", image: "https://images.unsplash.com/photo-1581009146145-b5ef03a7401f?auto=format&fit=crop&w=1200&q=80" },
            { name: "Chair Dips", sets: "3", reps: "8–12", tempo: "3s Negative", rest: "120s", notes: "Lean forward for chest focus.", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Shoulder Press", sets: "3", reps: "8–10", tempo: "3s Negative", rest: "120s", notes: "Keep core tight.", image: "https://images.unsplash.com/photo-1541534741688-6078c6bd35a5?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Lateral Raise", sets: "3", reps: "12", tempo: "4s Negative", rest: "60s", notes: "Pinkies up, very slow.", image: "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?auto=format&fit=crop&w=1200&q=80" },
          ]
        },
        2: {
          title: "Pull (Back, Biceps)",
          exercises: [
            { name: "Pull-ups", sets: "5", reps: "6–8", tempo: "3s Negative", rest: "150s", notes: "Control the stretch.", image: "https://images.unsplash.com/photo-1598971639058-aba7c12af937?auto=format&fit=crop&w=1200&q=80" },
            { name: "Slow Negative Pull-ups", sets: "3", reps: "3", tempo: "6s Negative", rest: "150s", notes: "Use chair to jump up.", image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=80" },
            { name: "One-arm DB Row", sets: "4", reps: "10–12", tempo: "3s Negative", rest: "90s", notes: "Pull to hip.", image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Hammer Curl", sets: "3", reps: "10–12", tempo: "3s Negative", rest: "60s", notes: "No swinging.", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Concentration Curl", sets: "2", reps: "12", tempo: "4s Negative", rest: "60s", notes: "Peak contraction.", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80" },
          ]
        },
        3: { title: "Rest", exercises: [] },
        4: {
          title: "Legs + Core",
          exercises: [
            { name: "Goblet Squat", sets: "4", reps: "12", tempo: "4s Negative", rest: "120s", notes: "Deep stretch.", image: "https://images.unsplash.com/photo-1574673130244-c707e9d8352b?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Bulgarian Split Squat", sets: "3", reps: "8–10", tempo: "3s Negative", rest: "120s", notes: "Balance focus.", image: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Romanian Deadlift", sets: "4", reps: "10–12", tempo: "4s Negative", rest: "120s", notes: "Feel the hamstrings.", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80" },
            { name: "Standing Calf Raise", sets: "4", reps: "15", tempo: "3s Negative", rest: "60s", notes: "Full range.", image: "https://images.unsplash.com/photo-1541534741688-6078c6bd35a5?auto=format&fit=crop&w=1200&q=80" },
            { name: "Plank", sets: "3", reps: "60s", tempo: "Tight", rest: "60s", notes: "Glutes engaged.", image: "https://images.unsplash.com/photo-1566241477600-ac026ad43874?auto=format&fit=crop&w=1200&q=80" },
          ]
        },
        5: {
          title: "Upper Body Hypertrophy",
          exercises: [
            { name: "Push-ups", sets: "3", reps: "12–15", tempo: "3s Negative", rest: "90s", notes: "Pump focus.", image: "https://images.unsplash.com/photo-1598971639058-aba7c12af937?auto=format&fit=crop&w=1200&q=80" },
            { name: "Pull-ups", sets: "3", reps: "6–10", tempo: "3s Negative", rest: "120s", notes: "Quality over quantity.", image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Shoulder Press", sets: "3", reps: "12", tempo: "3s Negative", rest: "90s", notes: "Burn out shoulders.", image: "https://images.unsplash.com/photo-1541534741688-6078c6bd35a5?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Row", sets: "3", reps: "12", tempo: "3s Negative", rest: "90s", notes: "T-shirt muscle focus.", image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Curl + Triceps Ext", sets: "3", reps: "12", tempo: "3s Negative", rest: "60s", notes: "Superset without rest.", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80" },
          ]
        },
        6: { title: "Rest", exercises: [] },
        7: { title: "Rest", exercises: [] },
      }
    },
    versionB: {
      days: {
        1: {
          title: "Push Focus (Maximum Stimulus)",
          exercises: [
            { name: "Decline Push-ups", sets: "4", reps: "10", tempo: "4 sec descent", rest: "120s", notes: "Hard gainer focus.", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Floor Press", sets: "4", reps: "12", tempo: "3 sec descent", rest: "120s", notes: "6kg dumbbells.", image: "https://images.unsplash.com/photo-1581009146145-b5ef03a7401f?auto=format&fit=crop&w=1200&q=80" },
            { name: "Chair Dips", sets: "3", reps: "10", tempo: "3 sec descent", rest: "120s", notes: "Keep elbows in.", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Shoulder Press", sets: "3", reps: "8–12", tempo: "3 sec descent", rest: "120s", notes: "Strict form.", image: "https://images.unsplash.com/photo-1541534741688-6078c6bd35a5?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Lateral Raise", sets: "3", reps: "12–15", tempo: "4 sec descent", rest: "90s", notes: "Control the weight.", image: "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?auto=format&fit=crop&w=1200&q=80" },
          ]
        },
        2: {
          title: "Pull Focus (Back Thickness)",
          exercises: [
            { name: "Pull-ups", sets: "5", reps: "Max", tempo: "Slow", rest: "150s", notes: "Dead hang.", image: "https://images.unsplash.com/photo-1598971639058-aba7c12af937?auto=format&fit=crop&w=1200&q=80" },
            { name: "Slow Negative Pull-ups", sets: "3", reps: "5", tempo: "6 sec descent", rest: "150s", notes: "Burn out lats.", image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=80" },
            { name: "One-arm DB Row", sets: "4", reps: "12", tempo: "3 sec descent", rest: "120s", notes: "Pull to hip bone.", image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Hammer Curl", sets: "3", reps: "12", tempo: "3 sec descent", rest: "90s", notes: "Thick arms.", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Concentration Curl", sets: "2", reps: "15", tempo: "4 sec descent", rest: "90s", notes: "Peak peak peak.", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80" },
          ]
        },
        3: { title: "Rest", exercises: [] },
        4: {
          title: "Legs + Abs",
          exercises: [
            { name: "Goblet Squat", sets: "4", reps: "15", tempo: "4 sec descent", rest: "150s", notes: "Deep deep.", image: "https://images.unsplash.com/photo-1574673130244-c707e9d8352b?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Bulgarian Split Squat", sets: "3", reps: "12", tempo: "3 sec descent", rest: "120s", notes: "Glute focus.", image: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Romanian Deadlift", sets: "4", reps: "12", tempo: "4 sec descent", rest: "120s", notes: "Back flat.", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80" },
            { name: "Standing Calf Raise", sets: "4", reps: "20", tempo: "3 sec descent", rest: "90s", notes: "Hold at top.", image: "https://images.unsplash.com/photo-1541534741688-6078c6bd35a5?auto=format&fit=crop&w=1200&q=80" },
            { name: "Plank", sets: "3", reps: "90s", tempo: "-", rest: "90s", notes: "Static hold.", image: "https://images.unsplash.com/photo-1566241477600-ac026ad43874?auto=format&fit=crop&w=1200&q=80" },
          ]
        },
        5: {
          title: "Upper Body Hypertrophy",
          exercises: [
            { name: "Push-ups", sets: "4", reps: "15", tempo: "3s Neg", rest: "120s", notes: "Quality.", image: "https://images.unsplash.com/photo-1598971639058-aba7c12af937?auto=format&fit=crop&w=1200&q=80" },
            { name: "Pull-ups", sets: "4", reps: "8", tempo: "3s Neg", rest: "120s", notes: "Wide grip.", image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Shoulder Press", sets: "4", reps: "12", tempo: "3s Neg", rest: "120s", notes: "Volume.", image: "https://images.unsplash.com/photo-1541534741688-6078c6bd35a5?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Row", sets: "4", reps: "12", tempo: "3s Neg", rest: "120s", notes: "Squeeze.", image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1200&q=80" },
            { name: "DB Curl + Triceps Ext", sets: "4", reps: "15", tempo: "3s Neg", rest: "90s", notes: "Burn it.", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80" },
          ]
        },
        6: { title: "Rest", exercises: [] },
        7: { title: "Rest", exercises: [] },
      }
    }

};

const attachDetails = (data: any) => {
  const versions = ['versionA', 'versionB'];
  versions.forEach(v => {
    Object.values(data[v].days).forEach((day: any) => {
      day.exercises = day.exercises.map((ex: any) => ({
        ...ex,
        description: EXERCISE_DETAILS[ex.name]?.description || "Follow the notes and maintain strictly controlled form.",
        focusMuscles: EXERCISE_DETAILS[ex.name]?.muscles || "Full Body"
      }));
    });
  });
  return data;
};

export const seedWorkoutData = async () => {
  try {
    const detailedData = attachDetails(workoutData);
    
    // Local storage fallback
    localStorage.setItem("workoutPlans", JSON.stringify(detailedData));

    // Firebase (will fail gracefully if keys are missing)
    try {
      const workoutPlansCol = collection(db, "workoutPlans");
      const weeklyPlanDoc = doc(workoutPlansCol, "weeklyPlan");
      const versionACol = collection(weeklyPlanDoc, "versionA");
      const versionBCol = collection(weeklyPlanDoc, "versionB");

      for (const [day, data] of Object.entries(detailedData.versionA.days)) {
        await setDoc(doc(versionACol, day), data);
      }
      for (const [day, data] of Object.entries(detailedData.versionB.days)) {
        await setDoc(doc(versionBCol, day), data);
      }
    } catch (e) {
      console.warn("Firebase seeding skipped or failed:", e);
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

