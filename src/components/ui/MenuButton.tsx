import React from "react";
import MenuButtonProps from "../../hooks/MenuButtonProps";

const MenuButton: React.FC<MenuButtonProps> =  ({name, _function}) => {
  return (
    <>
    <button className="pl-1.5 pr-8 py-3 border-l-1 border-b-1 border-l-gray-400 border-b-gray-400 text-gray-600 " onClick={_function}>{name}</button>
    </>
  );
};

export default MenuButton;