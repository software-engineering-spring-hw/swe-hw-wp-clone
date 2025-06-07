import { useRef, useCallback, Fragment } from "react";
import { SidebarUser } from "types/types";
import { List, ListItem, Avatar, Typography, Divider } from "@material-ui/core";
import { Person } from "@material-ui/icons";
import { css, cx } from "@emotion/css";
import { overflowHandler } from "styles/reusable-css-in-js-styles";
import { getAuthData } from "services/auth";
import { getUsersSqlClauses } from "services/graphql";
import { timeDisplayer } from "@guybendavid/utils";

type Props = {
  users?: SidebarUser[];
  searchValue: string;
  isMoreUsersToFetch: boolean;
  selectedUser?: SidebarUser;
  setSelectedUser: (user: SidebarUser) => void;
  fetchMoreUsers: (object: { variables: { loggedInUserId: string, offset: string, limit: string; }; }) => void;
};

const UsersList = ({ users = [], searchValue, isMoreUsersToFetch, selectedUser, setSelectedUser, fetchMoreUsers }: Props) => {
  const { loggedInUser } = getAuthData();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastUserRef = useCallback(node => {
    if (users.length === 0) return;
    observer.current?.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && isMoreUsersToFetch) {
        fetchMoreUsers({
          variables: {
            loggedInUserId: loggedInUser.id,
            offset: `${users.length}`,
            limit: `${getUsersSqlClauses.limit}`
          }
        });
      }
    });

    if (node) {
      observer.current.observe(node);
    }
    // eslint-disable-next-line
  }, [users, isMoreUsersToFetch]);

  return (
    <List className={style}>
      {users.filter(user => `${user.firstName} ${user.lastName}`.toUpperCase().includes(searchValue.toUpperCase()))
        .map((user, index) => {
          // Show placeholder avatar if:
          // 1. They blocked me (hasBlocked = true)
          // 2. OR we blocked each other (both isBlocked and hasBlocked = true)
          const shouldShowPlaceholderAvatar = user.hasBlocked;
          
          return (
            <Fragment key={index}>
              <ListItem 
                button 
                className={cx(
                  "list-item", 
                  selectedUser?.id === user.id && "is-selected"
                )} 
                onClick={() => setSelectedUser({ ...user })}
                ref={index === users.length - 1 ? lastUserRef : null}
              >
                {shouldShowPlaceholderAvatar ? (
                  // Show placeholder avatar if they blocked you (or mutual block)
                  <Avatar className="blocked-avatar">
                    <Person />
                  </Avatar>
                ) : (
                  // Show real avatar if no blocks or only you blocked them
                  <Avatar alt="avatar" src={user.image} />
                )}
                
                <div className="text-wrapper">
                  {index > 0 && <Divider className={cx((user.latestMessage?.createdAt && "is-chatted") || "")} />}
                  <div className="first-row">
                    <Typography component="span" className="fullname">
                      {`${user.firstName} ${user.lastName}`}
                    </Typography>
                    <Typography component="small">
                      {timeDisplayer(user.latestMessage?.createdAt || "")}
                    </Typography>
                  </div>
                  <div className="second-row">
                    <Typography className="last-message" component="span">
                      {user.latestMessage?.content}
                    </Typography>
                  </div>
                </div>
              </ListItem>
            </Fragment>
          );
        })}
    </List>
  );
};

export default UsersList;

const style = css`
  padding: 0 !important;
  overflow-y: auto;

  .list-item {
    display: flex;
    gap: 15px;
    padding-top: 10px;
    padding-bottom: 10px;

    &.is-selected {
      background: #f0f2f5;
    }

    .blocked-avatar {
      background-color: #e0e0e0 !important;
      color: #9e9e9e !important;
      
      svg {
        font-size: 1.2rem;
      }
    }

    .text-wrapper {
      flex: 1;

      .first-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .fullname {
          ${overflowHandler("162px")};
        }
      }

      .second-row {
        display: flex;

        .last-message {
          font-size: 0.9rem;
          color: var(--text-color);
          ${overflowHandler("260px")};
        }
      }

      hr {
        background-color: var(--divider-color);
        position: relative;
        height: 0.5px;

        &.is-chatted {
          bottom: 10px;
        }

        &:not(.is-chatted) {
          bottom: 18px;
        }
      }
    }
  }
`;