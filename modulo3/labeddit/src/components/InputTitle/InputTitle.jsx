import { TextField } from "@mui/material";
import { SecondaryColor } from "../../constants/Colors";

function InputTitle(props) {
  return (
    <TextField
      style={{backgroundColor: SecondaryColor}}
      required
      fullWidth
      id="outlined-basic"
      label="Title"
      variant="outlined"
      value={props.value}
      onChange={(e) => props.change(e.target.value)}
    />
  );
}

export default InputTitle;
