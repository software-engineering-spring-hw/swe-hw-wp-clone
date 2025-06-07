import { SidebarUser } from "types/types";
import { Avatar, Typography, IconButton, Menu, MenuItem, Chip } from "@material-ui/core";
import { css } from "@emotion/css";
import { overflowHandler } from "styles/reusable-css-in-js-styles";
import { timeDisplayer } from "@guybendavid/utils";
import { Search as SearchIcon, MoreVert as MoreVertIcon, Block, PersonAdd, Person } from "@material-ui/icons";
import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { BLOCK_USER, UNBLOCK_USER, GET_All_USERS_EXCEPT_LOGGED } from "services/graphql";
import { getAuthData } from "services/auth";

type Props = {
  selectedUser: SidebarUser;
  onUserUpdate?: (updatedUser: SidebarUser) => void;
};

const ChatHeader = ({ selectedUser, onUserUpdate }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [localUser, setLocalUser] = useState(selectedUser);
  const { loggedInUser } = getAuthData();

  const [blockUser] = useMutation(BLOCK_USER, {
    refetchQueries: [
      { 
        query: GET_All_USERS_EXCEPT_LOGGED,
        variables: {
          loggedInUserId: loggedInUser.id,
          offset: "0",
          limit: "50"
        }
      }
    ]
  });

  const [unblockUser] = useMutation(UNBLOCK_USER, {
    refetchQueries: [
      { 
        query: GET_All_USERS_EXCEPT_LOGGED,
        variables: {
          loggedInUserId: loggedInUser.id,
          offset: "0",
          limit: "50"
        }
      }
    ]
  });

  const handleMoreVertClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBlockUser = async () => {
    setLoading(true);
    try {
      await blockUser({ variables: { userId: selectedUser.id } });
      
      const updatedUser = { ...localUser, isBlocked: true };
      setLocalUser(updatedUser);
      onUserUpdate?.(updatedUser);
      
      handleMenuClose();
    } catch (error) {
      console.error('Error blocking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    setLoading(true);
    try {
      await unblockUser({ variables: { userId: selectedUser.id } });
      
      const updatedUser = { ...localUser, isBlocked: false };
      setLocalUser(updatedUser);
      onUserUpdate?.(updatedUser);
      
      handleMenuClose();
    } catch (error) {
      console.error('Error unblocking user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLocalUser(selectedUser);
  }, [selectedUser]);

  const currentUser = localUser;
  
  // Show placeholder avatar if:
  // 1. They blocked me (hasBlocked = true)
  // 2. OR we blocked each other (both isBlocked and hasBlocked = true)
  const shouldShowPlaceholderAvatar = currentUser.hasBlocked;
  
  return (
    <div className={style}>
      <div className="left-side">
        {shouldShowPlaceholderAvatar ? (
          // Show placeholder avatar if they blocked you (or mutual block)
          <Avatar className="blocked-avatar">
            <Person />
          </Avatar>
        ) : (
          // Show real avatar if no blocks or only you blocked them
          <Avatar alt="avatar" src={currentUser.image} />
        )}
        <div className="text-wrapper">
          <div className="name-and-status">
            <Typography className="fullname" component="span">
              {`${currentUser.firstName} ${currentUser.lastName}`}
            </Typography>
            {/* Show block status chips */}
            {currentUser.isBlocked && (
              <Chip 
                label="Blocked" 
                size="small" 
                color="secondary" 
                variant="outlined"
                className="status-chip"
              />
            )}
            {currentUser.hasBlocked && (
              <Chip 
                label="Blocked you" 
                size="small" 
                color="default" 
                variant="outlined"
                className="status-chip"
              />
            )}
          </div>
          <Typography component="small">
            {currentUser.isBlocked || currentUser.hasBlocked 
              ? (currentUser.isBlocked && currentUser.hasBlocked 
                  ? "You have blocked each other"
                  : currentUser.isBlocked 
                  ? "You blocked this user"
                  : "This user blocked you")
              : timeDisplayer(currentUser.latestMessage?.createdAt || "")
            }
          </Typography>
        </div>
      </div>
      <div>
        <IconButton>
          <SearchIcon />
        </IconButton>
        <IconButton onClick={handleMoreVertClick}>
          <MoreVertIcon />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem 
            onClick={currentUser.isBlocked ? handleUnblockUser : handleBlockUser}
            disabled={loading}
          >
            {currentUser.isBlocked ? (
              <>
                <PersonAdd style={{ marginRight: 8 }} />
                Unblock User
              </>
            ) : (
              <>
                <Block style={{ marginRight: 8 }} />
                Block User
              </>
            )}
          </MenuItem>
        </Menu>
      </div>
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

      .name-and-status {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .fullname {
        ${overflowHandler("265px")};
      }

      .status-chip {
        margin-left: 4px;
      }
    }
  }

  .blocked-avatar {
    background-color: #e0e0e0 !important;
    color: #9e9e9e !important;
    
    svg {
      font-size: 1.5rem;
    }
  }
`;