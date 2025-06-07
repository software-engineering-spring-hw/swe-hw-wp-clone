import { useState, SyntheticEvent, useContext, useEffect, useRef } from "react";
import { css } from "@emotion/css";
import { baseSearchInputStyle } from "styles/reusable-css-in-js-styles";
import { AppContext, AppContextType } from "contexts/AppContext";
import { SidebarUser } from "types/types";
import { useMutation } from "@apollo/client";
import { SEND_MESSAGE } from "services/graphql";
import { IconButton, InputBase, ClickAwayListener } from "@material-ui/core";
import { getFormValidationErrors } from "@guybendavid/utils";
import { Mood as MoodIcon, Attachment as AttachmentIcon, Mic as MicIcon } from "@material-ui/icons";
import EmojiPicker from "emoji-picker-react";

type Props = {
  selectedUser: SidebarUser;
};

const MessageCreator = ({ selectedUser }: Props) => {
  const { handleServerErrors, setSnackBarError } = useContext(AppContext) as AppContextType;
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessage("");
  }, [selectedUser]);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: () => setMessage(""),
    onError: (error) => handleServerErrors(error)
  });

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const sendMessagePayload = { content: message, recipientId: selectedUser.id };
    const { message: errorMessage } = getFormValidationErrors(sendMessagePayload);

    if (errorMessage) {
      setSnackBarError(errorMessage);
      return;
    }

    await sendMessage({ variables: sendMessagePayload });
  };

const handleEmojiClick = (emojiObject: any) => {
  setMessage(prev => prev + emojiObject.emoji);
  
  // Focus back on input after emoji selection  
  setTimeout(() => {
    inputRef.current?.focus();
  }, 100);
};

  const handleMoodIconClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleClickAway = () => {
    setShowEmojiPicker(false);
  };

  return (
    <div className={style}>
      <ClickAwayListener onClickAway={handleClickAway}>
        <div className="emoji-container">
          <IconButton onClick={handleMoodIconClick} className={showEmojiPicker ? "active" : ""}>
            <MoodIcon />
          </IconButton>
          
          {showEmojiPicker && (
            <div className="emoji-picker-wrapper">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={350}
                height={400}
              />
            </div>
          )}
        </div>
      </ClickAwayListener>

      <IconButton>
        <AttachmentIcon />
      </IconButton>

      <form onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <InputBase
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-base"
            placeholder={"Type a message"}
            inputProps={{ "aria-label": "create message" }}
            required
          />
        </div>
      </form>
      
      <IconButton>
        <MicIcon />
      </IconButton>
    </div>
  );
};

export default MessageCreator;

const style = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--gray-color);
  position: absolute;
  box-sizing: border-box;
  bottom: 0;
  width: 100%;
  padding: 10px 15px;

  .emoji-container {
    position: relative;

    .emoji-picker-wrapper {
      position: absolute;
      bottom: 60px;
      left: 0;
      z-index: 9999;
      
      /* Remove any conflicting styles */
      * {
        box-sizing: border-box;
      }
    }
  }

  .active {
    background: rgba(0, 0, 0, 0.1) !important;
    border-radius: 50% !important;
  }

  form {
    ${baseSearchInputStyle};
    padding: 0 10px;
    flex: 1;

    .input-wrapper {
      padding: 5px 0 5px 20px;
    }
  }

  svg {
    font-size: 1.7rem !important;
  }
`;