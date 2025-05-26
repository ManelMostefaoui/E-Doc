import { Edit } from "lucide-react";

const EditButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="text-[#008080] font-semibold flex items-center gap-4 border-2 border-[#008080] rounded-lg px-7 py-2 hover:text-[#F7F9F9] hover:bg-[#008080] transition duration-150"
    >
      Edit
      <Edit size={16} />
    </button>
  );
};

export default EditButton;
