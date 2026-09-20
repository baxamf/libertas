import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UsersFilters({
  email = "",
  role = "all",
}: {
  email?: string;
  role?: string;
}) {
  return (
    // native GET form — filtering works without client JS, browser drives navigation
    <form className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-xs text-muted-foreground">
          Email
        </label>
        <Input
          id="email"
          name="email"
          placeholder="Search by email"
          defaultValue={email}
          className="w-56"
        />
      </div>
      <Select name="role" defaultValue={role ?? "all"}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="USER">User</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">Apply</Button>
    </form>
  );
}
