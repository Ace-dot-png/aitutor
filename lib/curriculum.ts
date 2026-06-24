import curriculumData from "@/data/curriculum.json";

export interface Topic {
  id: string;
  title: string;
  subtopics: string[];
}

export interface SubjectData {
  label: string;
  topics: Topic[];
}

export interface GradeData {
  mathematics: SubjectData;
  physics: SubjectData;
  english: SubjectData;
}

type CurriculumData = {
  grades: {
    [grade: string]: GradeData;
  };
};

const data = curriculumData as any;

export function getTopics(grade: string, subject: string): Topic[] {
  const gradeData = data.grades[grade];
  if (!gradeData) return [];
  const key = subject.toLowerCase() === "physical sciences" ? "physics" : subject.toLowerCase();
  return gradeData[key]?.topics || [];
}

export function getTopicById(grade: string, subject: string, topicId: string): Topic | undefined {
  return getTopics(grade, subject).find((t: Topic) => t.id === topicId);
}

export function getAllTopics(grade: string): { subject: string; label: string; topics: Topic[] }[] {
  const gradeData = data.grades[grade];
  if (!gradeData) return [];
  return [
    { subject: "MATHEMATICS", label: gradeData.mathematics.label, topics: gradeData.mathematics.topics },
    { subject: "PHYSICS", label: gradeData.physics.label, topics: gradeData.physics.topics },
    { subject: "ENGLISH", label: gradeData.english.label, topics: gradeData.english.topics },
  ];
}

export function getSubjectLabel(subject: string, grade: string): string {
  const gradeData = data.grades[grade];
  if (!gradeData) return subject;
  const key = subject.toLowerCase() === "physical sciences" ? "physics" : subject.toLowerCase();
  return gradeData[key]?.label || subject;
}
