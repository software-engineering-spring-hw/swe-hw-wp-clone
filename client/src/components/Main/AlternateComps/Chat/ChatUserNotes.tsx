import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_USER_NOTE } from "services/graphql";

type Props = {
  selectedUser: any;
  setSelectedUser: (user: any) => void;
};

const ChatUserNotes = ({ selectedUser, setSelectedUser }: Props) => {
  const [noteDraft, setNoteDraft] = useState(selectedUser?.userNotes || "");
  const [updateUserNote, { loading }] = useMutation(UPDATE_USER_NOTE);

  useEffect(() => {
    setNoteDraft(selectedUser?.userNotes || "");
  }, [selectedUser]);

  const saveNote = async () => {
    if (!selectedUser) return;
    try {
      const { data } = await updateUserNote({
        variables: { userId: selectedUser.id, userNotes: noteDraft }
      });
      if (data?.updateUserNotes) {
        setSelectedUser(data.updateUserNotes);
        
      }
    } catch (error) {
     
    }
  };

  return (
    <div style={{ marginTop: 16, padding: 12, backgroundColor: "#fff", borderRadius: 6, boxShadow: "0 0 4px rgba(0,0,0,0.1)" }}>
      <h4>Kullanıcı Notu</h4>
      <textarea
        rows={4}
        placeholder="Bu kullanıcı için not ekleyin..."
        value={noteDraft}
        onChange={(e) => setNoteDraft(e.target.value)}
        disabled={loading}
        style={{ width: "100%", padding: 8, fontSize: 14, borderRadius: 4, border: "1px solid #ccc" }}
      />
      <button onClick={saveNote} disabled={loading} style={{ marginTop: 8, padding: "6px 12px", cursor: "pointer" }}>
        Kaydet
      </button>
    </div>
  );
};

export default ChatUserNotes;
