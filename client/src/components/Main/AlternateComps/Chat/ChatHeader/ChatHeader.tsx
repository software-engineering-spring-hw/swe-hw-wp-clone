import { SidebarUser } from "types/types";
import { Avatar, Typography, IconButton, Dialog, DialogTitle, DialogContent, TextField, List, ListItem, ListItemAvatar, ListItemText, Button } from "@material-ui/core";
import { css } from "@emotion/css";
import { overflowHandler } from "styles/reusable-css-in-js-styles";
import { timeDisplayer } from "@guybendavid/utils";
import { Search as SearchIcon, MoreVert as MoreVertIcon } from "@material-ui/icons";
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_All_USERS_EXCEPT_LOGGED } from "services/graphql";
import { ADD_GROUP_MEMBER } from "services/add-group-member";

type Props = {
  selectedUser: SidebarUser;
};

const ChatHeader = ({ selectedUser }: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const isGroup = !selectedUser.lastName && !selectedUser.image;

  // Fetch all users except logged in
  const { data } = useQuery(GET_All_USERS_EXCEPT_LOGGED, { variables: { loggedInUserId: "", offset: "0", limit: "100" } });
  const [addGroupMember] = useMutation(ADD_GROUP_MEMBER, {
    onError: (error) => alert(error.message),
    onCompleted: () => alert('Member added!')
  });

  // Get group members' ids
  const groupMemberIds = (selectedUser as any).members?.map((m: any) => m.id) || [];
  const users = (data?.getAllUsersExceptLogged?.users || []).filter((u: any) => !groupMemberIds.includes(u.id));
  const filteredUsers = users.filter((u: any) =>
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (selected) {
      try {
        await addGroupMember({ variables: { groupId: selectedUser.id, userId: selected } });
        setOpen(false);
        setSelected(null);
        setSearch("");
      } catch (e) {
        // error handled by onError
      }
    }
  };

  return (
    <div className={style}>
      <div className="left-side">
        <Avatar alt="avatar" src={selectedUser.image} />
        <div className="text-wrapper">
          <Typography className="fullname" component="span">{`${selectedUser.firstName} ${selectedUser.lastName}`}</Typography>
          <Typography component="small">{timeDisplayer(selectedUser.latestMessage.createdAt || "")}</Typography>
        </div>
      </div>
      <div>
        {isGroup && (
          <Button variant="outlined" size="small" style={{ marginRight: 8 }} onClick={() => setOpen(true)}>
            Add members
          </Button>
        )}
        {[SearchIcon, MoreVertIcon].map((Icon, index) => (
          <IconButton key={index}>
            <Icon />
          </IconButton>
        ))}
      </div>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add members to group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search users"
            type="text"
            fullWidth
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <List>
            {filteredUsers.map((user: any) => (
              <ListItem button key={user.id} selected={selected === user.id} onClick={() => setSelected(user.id)}>
                <ListItemAvatar>
                  <Avatar src={user.image} />
                </ListItemAvatar>
                <ListItemText primary={`${user.firstName} ${user.lastName}`} />
              </ListItem>
            ))}
          </List>
          <Button onClick={handleAdd} color="primary" variant="contained" disabled={!selected} fullWidth style={{ marginTop: 8 }}>
            Add
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatHeader;

const style = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--gray-color);
  padding: var(--header-padding);
  border-left: 1px solid lightgray;

  .left-side {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 15px;

    .text-wrapper {
      display: flex;
      flex-direction: column;

      .fullname {
        ${overflowHandler("265px")};
      }
    }
  }
`;