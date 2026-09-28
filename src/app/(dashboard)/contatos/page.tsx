import { Search, Plus, MoreVertical, Edit, Trash2, Mail, Phone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getContacts, deleteContact } from "@/actions/contacts";
import Link from "next/link";

interface ContactsPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const { search = "", page = "1" } = await searchParams;
  const pageNum = parseInt(page, 10) || 1;

  const { contacts, totalCount, totalPages } = await getContacts(search, pageNum);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
          <p className="text-muted-foreground">
            Gerencie seus contatos e leads
          </p>
        </div>
        <Link href="/contatos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Contato
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <form className="flex-1 max-w-md">
          <Input
            type="search"
            name="search"
            placeholder="Pesquisar contatos..."
            defaultValue={search}
            className="h-9"
          />
        </form>
      </div>

      <Table>
        <TableCaption>Lista de contatos cadastrados</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <p className="text-muted-foreground">
                  {search
                    ? "Nenhum contato encontrado com esse termo"
                    : "Nenhum contato cadastrado"}
                </p>
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>
                  {contact.email ? (
                    <a href={`mailto:${contact.email}`} className="text-blue-500 hover:underline">
                      <Mail className="inline mr-1 h-3 w-3" />
                      {contact.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {contact.phone ? (
                    <a href={`tel:${contact.phone}`} className="text-blue-500 hover:underline">
                      <Phone className="inline mr-1 h-3 w-3" />
                      {contact.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {contact.company ? (
                    <>
                      <Building2 className="inline mr-1 h-3 w-3" />
                      {contact.company}
                    </>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link href={`/contatos/${contact.id}/editar`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={async () => {
                          if (confirm("Tem certeza que deseja excluir este contato?")) {
                            const result = await deleteContact(contact.id);
                            if (result.error) {
                              alert(result.error);
                            } else {
                              window.location.reload();
                            }
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {pageNum > 1 && (
            <Link href={`/contatos?search=${encodeURIComponent(search)}&page=${pageNum - 1}`}>
              <Button variant="outline" size="sm">
                Anterior
              </Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Página {pageNum} de {totalPages} ({totalCount} total)
          </span>
          {pageNum < totalPages && (
            <Link href={`/contatos?search=${encodeURIComponent(search)}&page=${pageNum + 1}`}>
              <Button variant="outline" size="sm">
                Próxima
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}