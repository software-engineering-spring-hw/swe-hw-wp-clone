import { useContext, useState, useEffect, useRef } from "react";
import { css } from "@emotion/css";
import { AppContext, AppContextType } from "contexts/AppContext";
import { useQuery, useLazyQuery, InMemoryCache, useMutation, gql } from "@apollo/client";
import { getAuthData } from "services/auth";
import { getUsersQueryVariables, GET_All_USERS_EXCEPT_LOGGED, GET_USER, GET_GROUPS } from "services/graphql";
import { displayNewMessageOnSidebar, displayNewUserOnSidebar } from "services/sidebar-helper";
import { SidebarUser, Message } from "types/types";
import Actions from "./Actions/Actions";
import UsersList from "./UsersList/UsersList";
import { LEAVE_GROUP } from "services/leave-group";

type Props = {
  newMessage?: Message;
  selectedUser?: SidebarUser;
  setSelectedUser: (user: SidebarUser) => void;
};

const CREATE_GROUP = gql`
  mutation CreateGroup($name: String!, $memberIds: [ID!]!) {
    createGroup(name: $name, memberIds: $memberIds) {
      id
      name
      members { id firstName lastName }
    }
  }
`;

const Sidebar = ({ selectedUser, setSelectedUser, newMessage }: Props) => {
  const { loggedInUser } = getAuthData();
  const { handleServerErrors } = useContext(AppContext) as AppContextType;
  const [searchValue, setSearchValue] = useState("");
  const [groupName, setGroupName] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<SidebarUser[]>([]);
  const memberInputRef = useRef<HTMLInputElement>(null);
  const { data, fetchMore: fetchMoreUsers, client } = useQuery(GET_All_USERS_EXCEPT_LOGGED, {
    variables: getUsersQueryVariables(loggedInUser.id),
    onError: (error) => handleServerErrors(error)
  });

  const { data: groupsData } = useQuery(GET_GROUPS);

  const sidebarData = data?.getAllUsersExceptLogged;
  const isMoreUsersToFetch = sidebarData?.users.length < sidebarData?.totalUsersExceptLoggedUser;

  const [getUser, { data: newUserData }] = useLazyQuery(GET_USER, {
    onError: (error) => handleServerErrors(error)
  });

  const [createGroup] = useMutation(CREATE_GROUP, {
    onCompleted: () => {
      setGroupName("");
      setSelectedMembers([]);
      alert("Grup başarıyla oluşturuldu!");
    }
  });

  const [leaveGroup] = useMutation(LEAVE_GROUP, {
    onCompleted: () => alert("You left the group!"),
    onError: (error) => alert(error.message)
  });

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

  // Filter users for member search
  const filteredUsers = sidebarData?.users?.filter(
    (user: SidebarUser) =>
      user.firstName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      user.lastName.toLowerCase().includes(memberSearch.toLowerCase())
  ) || [];

  // Add member by clicking suggestion
  const addMember = (user: SidebarUser) => {
    if (!selectedMembers.find(m => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setMemberSearch("");
    memberInputRef.current?.focus();
  };

  // Remove member chip
  const removeMember = (id: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== id));
  };

  // Right-click handler for group leave
  const handleGroupContextMenu = (e: React.MouseEvent, group: any) => {
    e.preventDefault();
    if (window.confirm(`Leave group '${group.name}'?`)) {
      leaveGroup({ variables: { groupId: group.id, userId: loggedInUser.id } });
    }
  };

  return (
    <div className={style}>
      <Actions setSearchValue={setSearchValue} />
      <form onSubmit={e => { e.preventDefault(); createGroup({ variables: { name: groupName, memberIds: selectedMembers.map(m => m.id) } }); }} style={{ padding: 8, background: '#f6f6f6', borderBottom: '1px solid #eee' }}>
        <input
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          required
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {selectedMembers.map(member => (
            <span key={member.id} style={{ background: '#eafff3', borderRadius: 12, padding: '2px 8px', display: 'flex', alignItems: 'center' }}>
              {member.firstName} {member.lastName}
              <button type="button" style={{ marginLeft: 4, border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => removeMember(member.id)}>×</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add member by name"
          value={memberSearch}
          onChange={e => setMemberSearch(e.target.value)}
          ref={memberInputRef}
          style={{ marginBottom: 4 }}
        />
        {memberSearch && (
          <div style={{ background: '#fff', border: '1px solid #eee', maxHeight: 100, overflowY: 'auto', marginBottom: 8 }}>
            {filteredUsers.length === 0 && <div style={{ padding: 4 }}>No user found</div>}
            {filteredUsers.map((user: SidebarUser) => (
              <div key={user.id} style={{ padding: 4, cursor: 'pointer' }} onClick={() => addMember(user)}>
                {user.firstName} {user.lastName}
              </div>
            ))}
          </div>
        )}
        <button type="submit" disabled={!groupName || selectedMembers.length === 0}>Create Group</button>
      </form>
      <div className="group-list" style={{ borderBottom: '1px solid #eee', padding: 8 }}>
        <b>Groups</b>
        {groupsData?.getGroups?.length === 0 && <div>No groups</div>}
        {groupsData?.getGroups?.map((group: any) => (
          <div
            key={group.id}
            className="group-item"
            style={{ cursor: 'pointer', padding: 4, background: selectedUser?.id === group.id ? '#eafff3' : undefined }}
            onClick={() => setSelectedUser({ id: group.id, firstName: group.name, lastName: '', image: '', latestMessage: { content: '', createdAt: '' } })}
            onContextMenu={e => handleGroupContextMenu(e, group)}
          >
            <span role="img" aria-label="group">👥</span> {group.name}
          </div>
        ))}
      </div>
      <UsersList searchValue={searchValue} users={sidebarData?.users} isMoreUsersToFetch={isMoreUsersToFetch}
        selectedUser={selectedUser} setSelectedUser={setSelectedUser} fetchMoreUsers={fetchMoreUsers} />
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
`;