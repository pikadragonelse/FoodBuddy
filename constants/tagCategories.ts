// ========================
// Scenarios for "Blind Date"
// ========================
export interface Scenario {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "1",
    emoji: "💔",
    title: "Đang thất tình",
    description: "Cần món gì đó an ủi tâm hồn",
  },
  {
    id: "2",
    emoji: "💸",
    title: "Mới lãnh lương",
    description: "Tự thưởng bản thân, không lo về giá",
  },
  {
    id: "3",
    emoji: "🏃",
    title: "Muốn đi trốn",
    description: "Tìm góc quán yên bình, ít người",
  },
  {
    id: "4",
    emoji: "🌹",
    title: "Hẹn hò lãng mạn",
    description: "Không gian chill, đồ ăn tinh tế",
  },
  {
    id: "5",
    emoji: "🥴",
    title: "Giải rượu gấp",
    description: "Món nước nóng hổi cho tỉnh táo",
  },
  {
    id: "6",
    emoji: "🥗",
    title: "Eat Clean",
    description: "Healthy balance, không dầu mỡ",
  },
  {
    id: "7",
    emoji: "🍺",
    title: "Nhậu tới bến",
    description: "Bia bọt, mồi ngon, vui là chính",
  },
  {
    id: "8",
    emoji: "🥘",
    title: "Cơm nhà ấm cúng",
    description: "Tìm hương vị gia đình, truyền thống",
  },
  {
    id: "9",
    emoji: "🍰",
    title: "Sống ảo Coffee",
    description: "View đẹp lung linh, check-in mỏi tay",
  },
  {
    id: "10",
    emoji: "🍥",
    title: "Ăn vặt đường phố",
    description: "Thiên đường quà vặt, rẻ mà ngon",
  },
];
