import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React, { FunctionComponent } from "react";
import './DialogBox.scss';

type DialogProps = {
    open: boolean
    title: string
    content: string
    agreeBtnMsg: string
    disagreeMsg: string
    handleAgree: () => void
    handleDisagree: () => void
}
const DialogBox: FunctionComponent<DialogProps> = ({open, title, content, agreeBtnMsg, disagreeMsg, handleAgree, handleDisagree}) => {
    return(
        <Dialog open={open} className="dialogbox-container">
            <DialogTitle className="dialogbox-title">{title}</DialogTitle>
            <DialogContent className="dialogbox-content">
                <DialogContentText className="dialogbox-contenttext">{content}</DialogContentText>
            </DialogContent>
            <DialogActions className="dialogbox-btns">
                <Button variant="contained" className="dialogbox-yesbtn" onClick={handleAgree}>{agreeBtnMsg}</Button>
                <Button variant="outlined" className="dialogbox-nobtn" onClick={handleDisagree}>{disagreeMsg}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DialogBox;