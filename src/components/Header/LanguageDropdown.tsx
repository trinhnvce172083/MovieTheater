"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalOutlined } from "@ant-design/icons";

export default function LanguageDropdown() {
  return (
    <div className="flex items-center relative">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center space-x-2 hover:text-red-500 transition-colors">
          <GlobalOutlined style={{ fontSize: "16px", marginRight: "4px" }} />
          <span>EN</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="z-50 min-w-[100px] mr-4"
          align="end"
          sideOffset={8}
          alignOffset={-20}
        >
          <DropdownMenuItem className="flex justify-center hover:bg-red-500 hover:text-white cursor-pointer transition-colors focus:bg-red-500 focus:text-white">
            English
          </DropdownMenuItem>
          <DropdownMenuItem className="flex justify-center hover:bg-red-500 hover:text-white cursor-pointer transition-colors focus:bg-red-500 focus:text-white">
            Vietnamese
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}