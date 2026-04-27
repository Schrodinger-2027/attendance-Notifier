/**
 * Model: Student
 * In-memory store (swap for DB in production).
 */

const students = [
  { id: 1, name: "Deepak Singh",  initials: "DS", av: "av-blue",   parent: "Sunita Sharma",   parentEmail: "iit2023037@iiita.ac.in" },
  { id: 2, name: "Priya Mehta",   initials: "PM", av: "av-teal",   parent: "Rekha Mehta",     parentEmail: "parent2@example.com" },
  { id: 3, name: "Rohan Gupta",   initials: "RG", av: "av-purple", parent: "Anil Gupta",      parentEmail: "parent3@example.com" },
  { id: 4, name: "Kavya Nair",    initials: "KN", av: "av-coral",  parent: "Deepa Nair",      parentEmail: "parent4@example.com" },
  { id: 5, name: "Arjun Singh",   initials: "AR", av: "av-amber",  parent: "Manpreet Singh",  parentEmail: "parent5@example.com" },
  { id: 6, name: "Diya Patel",    initials: "DP", av: "av-pink",   parent: "Heena Patel",     parentEmail: "parent6@example.com" },
];

// attendance status per student
const statusMap = {};
students.forEach((s) => (statusMap[s.id] = "present"));

class StudentModel {
  static getAll() {
    return students.map((s) => ({ ...s, status: statusMap[s.id] }));
  }

  static findById(id) {
    return students.find((s) => s.id === Number(id)) || null;
  }

  static getStatus(id) {
    return statusMap[Number(id)] || null;
  }

  static setStatus(id, status) {
    const prev = statusMap[Number(id)];
    statusMap[Number(id)] = status;
    return prev;
  }

  static getStats() {
    const vals = Object.values(statusMap);
    return {
      present: vals.filter((v) => v === "present").length,
      absent:  vals.filter((v) => v === "absent").length,
      late:    vals.filter((v) => v === "late").length,
      total:   students.length,
    };
  }
}

module.exports = StudentModel;
