import { useState } from "react";
import { formatDateTime } from "@repo/date-utils";
import { Mail, MailOpen, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui";
import type { Contact } from "@repo/types";

interface ContactTableProps {
  contacts: Contact[];
  onMarkAsRead: (id: number) => void;
}

export function ContactTable({ contacts, onMarkAsRead }: ContactTableProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  if (contacts.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        문의가 없습니다.
      </p>
    );
  }

  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    if (!contact.is_read) {
      onMarkAsRead(contact.id);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]" />
            <TableHead>이름</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead className="w-[300px]">제목</TableHead>
            <TableHead>수신일</TableHead>
            <TableHead className="text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow
              key={contact.id}
              className={!contact.is_read ? "bg-accent/30" : ""}
            >
              <TableCell>
                {contact.is_read ? (
                  <MailOpen className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Mail className="h-4 w-4 text-primary" />
                )}
              </TableCell>
              <TableCell className="font-medium">{contact.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {contact.email}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {contact.subject}
                  {!contact.is_read && (
                    <Badge variant="destructive" className="text-xs">
                      NEW
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(contact.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleView(contact)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 문의 상세 모달 */}
      <Dialog
        open={!!selectedContact}
        onOpenChange={() => setSelectedContact(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedContact?.subject}</DialogTitle>
            <DialogDescription>
              {selectedContact?.name} ({selectedContact?.email}) &middot;{" "}
              {selectedContact &&
                formatDateTime(selectedContact.created_at)}
            </DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {selectedContact?.message}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
