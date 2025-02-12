const API_URL = "http://localhost:8000/api";

export const saveRoom = async (roomData: any) => {
  try {
    const response = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room: {
          id: roomData.id,
          type: "rectangle",
          position: { x: roomData.x, y: roomData.y },
          dimensions: { width: roomData.width, height: roomData.height },
          walls: {
            north: { height: 25, style: "primary" },
            east: { height: 25, style: "secondary" },
            south: { height: 25, style: "primary" },
            west: { height: 25, style: "secondary" },
          },
        },
        branding: {
          colors: {
            primary: "#2A5C8A",
            secondary: "#3BA18D",
            background: "#F0F4F7",
          },
          shadows: true,
        },
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error saving room:", error);
    throw error;
  }
};
