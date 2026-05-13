import { Link } from "react-router-dom"
import { NoteForm } from "@/components/NoteForm"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function NoteNewPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/notes">Notes</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New note</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Create note</CardTitle>
          <CardDescription>Add a new note to your collection.</CardDescription>
        </CardHeader>
        <CardContent>
          <NoteForm />
        </CardContent>
      </Card>
    </div>
  )
}
