import { useState } from "react";

const DefautlUser = {
  callsign: "RECRUIT",
  rank: "Scout",
  bio: "Focusing on the path ahead.",
};

export function useUserDossier() {
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("user_dossier");
    return saved ? JSON.parse(saved) : DefautlUser;
  });

  const updateUser = (newData: any) => {
    setUserData(newData);
    localStorage.setItem("user_dossier", JSON.stringify(newData));
    return newData;
  };

  return { userData, updateUser };
}
