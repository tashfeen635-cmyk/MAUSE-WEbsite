// Default Team Members Data
const DEFAULT_TEAM_DATA = [
  {
    id: 1,
    name: "Maqsood Ahmed Dar",
    position: "Founder / Chief Executive Officer",
    description: "Visionary leader driving company growth, strategy, and long-term business excellence.",
    image: "assets/img/team/team-1.jpg",
    social: {
      twitter: "#",
      facebook: "#",
      instagram: "#",
      linkedin: "#"
    }
  },
  {
    id: 2,
    name: "Hammad Ahmed Dar",
    position: "Managing Director",
    description: "Oversees operations, ensures efficiency, and leads teams to achieve organizational goals.",
    image: "assets/img/team/team-2.jpg",
    social: {
      twitter: "#",
      facebook: "#",
      instagram: "#",
      linkedin: "#"
    }
  },
  {
    id: 3,
    name: "Dr Mehfooz Ullah Dar",
    position: "Consultant",
    description: "Provides expert advice, strategic insights, and professional guidance for informed decision-making.",
    image: "assets/img/team/team-3.jpg",
    social: {
      twitter: "#",
      facebook: "#",
      instagram: "#",
      linkedin: "#"
    }
  },
  {
    id: 4,
    name: "Mehran Ali",
    position: "Manager",
    description: "Responsible for team management, workflow coordination, and achieving company targets efficiently.",
    image: "assets/img/team/team-4.jpg",
    social: {
      twitter: "#",
      facebook: "#",
      instagram: "#",
      linkedin: "#"
    }
  },
  {
    id: 5,
    name: "M.Ahmed Hussain",
    position: "Civil Engineer",
    description: "Certified civil engineer with expertise in construction planning, structural analysis, and site management.",
    image: "assets/img/team/team-5.jpg",
    social: {
      twitter: "#",
      facebook: "#",
      instagram: "#",
      linkedin: "#"
    }
  },
  {
    id: 6,
    name: "Muhammad Shoaib",
    position: "Electrical Engineer",
    description: "Skilled electrical engineer specializing in electrical design, power systems, installation, maintenance, and energy-efficient solutions.",
    image: "assets/img/team/team-6.jpg",
    social: {
      twitter: "#",
      facebook: "#",
      instagram: "#",
      linkedin: "#"
    }
  }
];

// Get team data from localStorage or use default
function getTeamData() {
  const stored = localStorage.getItem('masTeamData');
  if (stored) {
    return JSON.parse(stored);
  }
  return [...DEFAULT_TEAM_DATA];
}

// Save team data to localStorage
function saveTeamData(data) {
  localStorage.setItem('masTeamData', JSON.stringify(data));
}

// Reset to default data
function resetTeamData() {
  localStorage.removeItem('masTeamData');
  return [...DEFAULT_TEAM_DATA];
}
