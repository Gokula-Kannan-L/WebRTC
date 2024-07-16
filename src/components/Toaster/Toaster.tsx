import { Alert, AlertColor, AlertPropsColorOverrides } from "@mui/material";
import React, { FunctionComponent } from "react";
import {OverridableStringUnion} from '@mui/types'

type ToasterProps = {
    message: string
    severity: OverridableStringUnion<AlertColor, AlertPropsColorOverrides>
}
const Toaster:FunctionComponent<ToasterProps> = ({message, severity}) => {
    return(
        <Alert variant="filled" severity={severity}>
            {message}
        </Alert>
    )
}

export default Toaster;