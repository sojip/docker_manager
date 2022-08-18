import Icon from "@mdi/react";
import { mdiCloseThick } from "@mdi/js";

const ShiftsDetails = (props) => {
  const { handleClose } = props;
  return (
    <div>
      <div className="closeModalWrapper" onClick={handleClose}>
        <Icon path={mdiCloseThick} size={1} />
      </div>
      <div>Hello</div>
    </div>
  );
};

export default ShiftsDetails;
