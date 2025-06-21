import { useContext, useState, useEffect, KeyboardEvent } from "react";
import { css } from "@emotion/css";
import { AppContext, AppContextType } from "contexts/AppContext";
import { useQuery, useLazyQuery, useMutation, InMemoryCache } from "@apollo/client";
import { getAuthData } from "services/auth";
import { getUsersQueryVariables, GET_All_USERS_EXCEPT_LOGGED, GET_USER, UPDATE_USER_NOTE } from "services/graphql";
import { displayNewMessageOnSidebar, displayNewUserOnSidebar } from "services/sidebar-helper";
import { SidebarUser, Message } from "types/types";
import Actions from "./Actions/Actions";
import UsersList from "./UsersList/UsersList";

type Props = {
  newMessage?: Message;
  selectedUser?: SidebarUser;
  setSelectedUser: (user: SidebarUser) => void;
};

const Sidebar = ({ selectedUser, setSelectedUser, newMessage }: Props) => {
  const { loggedInUser } = getAuthData();
  const { handleServerErrors } = useContext(AppContext) as AppContextType;
  const [searchValue, setSearchValue] = useState("");

  const { data, fetchMore: fetchMoreUsers, client } = useQuery(GET_All_USERS_EXCEPT_LOGGED, {
    variables: getUsersQueryVariables(loggedInUser.id),
    onError: (error) => handleServerErrors(error)
  });

  const sidebarData = data?.getAllUsersExceptLogged;
  const isMoreUsersToFetch = sidebarData?.users.length < sidebarData?.totalUsersExceptLoggedUser;

  const [getUser, { data: newUserData }] = useLazyQuery(GET_USER, {
    onError: (error) => handleServerErrors(error)
  });

  const [updateUserNote] = useMutation(UPDATE_USER_NOTE, {
    onError: (error) => handleServerErrors(error),
    update(cache, { data }) {
      if (!data?.updateUserNotes) return;
      const updatedUser = data.updateUserNotes;

      cache.modify({
        fields: {
          getAllUsersExceptLogged(existing = {}) {
            const updatedUsers = existing.users.map((user: any) =>
              user.id === updatedUser.id
                ? { ...user, userNotes: updatedUser.userNotes }
                : user
            );
            return {
              ...existing,
              users: updatedUsers
            };
          }
        }
      });
    }
  });

  const [noteDraft, setNoteDraft] = useState(selectedUser?.userNotes || "");

  useEffect(() => {
    if (newMessage) {
      displayNewMessageOnSidebar({
        cache: client.cache as InMemoryCache,
        newMessage,
        sidebarUsers: sidebarData?.users,
        isMoreUsersToFetch,
        getUser
      });
    }
    // eslint-disable-next-line
  }, [newMessage]);

  useEffect(() => {
    if (newMessage && newUserData) {
      const { recipientId, senderId, ...userLatestMessageProperties } = newMessage;
      const sidebarNewUser = { ...newUserData.getUser };
      sidebarNewUser.latestMessage = { ...userLatestMessageProperties };
      displayNewUserOnSidebar({ sidebarNewUser, client });
    }
    // eslint-disable-next-line
  }, [newUserData]);

  // selectedUser değiştiğinde noteDraft'ı güncelle
  useEffect(() => {
    setNoteDraft(selectedUser?.userNotes || "");
  }, [selectedUser]);

  const saveNote = () => {
    if (!selectedUser) return;
    updateUserNote({
      variables: {
        userId: selectedUser.id,
        userNotes: noteDraft,
      }
    });
    setSelectedUser({ ...selectedUser, userNotes: noteDraft });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // satır atlamayı engelle
      saveNote();
    }
  };

  return (
    <div className={style}>
      <Actions setSearchValue={setSearchValue} />
      <UsersList
        searchValue={searchValue}
        users={sidebarData?.users}
        isMoreUsersToFetch={isMoreUsersToFetch}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        fetchMoreUsers={fetchMoreUsers}
      />
      {selectedUser && (
        <div className="note-editor">
          <textarea
            placeholder="Enter a note for this contact..."
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="save-note-btn" onClick={saveNote}>Save Note</button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

const style = css`
  display: flex;
  flex-direction: column;
  background: white;
  min-width: 353px;
  flex: 0.3;

  .note-editor {
    margin: 10px;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .note-editor textarea {
    width: 100%;
    height: 60px;
    resize: vertical;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 14px;
    font-family: inherit;
  }

  .save-note-btn {
    align-self: flex-end;
    padding: 6px 12px;
    background-color: #25d366;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
  }
  .save-note-btn:hover {
    background-color: #1ebe57;
  }
`;
