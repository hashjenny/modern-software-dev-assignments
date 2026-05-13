'use server'

import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getNotes(page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize
  const notes = await prisma.note.findMany({
    take: pageSize,
    skip,
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })
  const total = await prisma.note.count()
  return { notes, total }
}

export async function getNote(id: number) {
  return prisma.note.findUnique({
    where: { id },
    include: { category: true },
  })
}

export async function createNote(data: { title: string; content?: string; categoryId?: number }) {
  return prisma.note.create({
    data: {
      title: data.title,
      content: data.content || '',
      categoryId: data.categoryId,
    },
  })
}

export async function updateNote(id: number, data: { title?: string; content?: string; categoryId?: number | null }) {
  return prisma.note.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      categoryId: data.categoryId,
    },
  })
}

export async function deleteNote(id: number, redirectTo?: string) {
  await prisma.note.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/notes')
  if (redirectTo) {
    redirect(redirectTo)
  }
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { notes: true } } },
  })
}

export async function createCategory(data: { name: string }) {
  return prisma.category.create({ data })
}

export async function deleteCategory(id: number) {
  await prisma.category.delete({ where: { id } })
  revalidatePath('/categories')
}

export async function searchNotes(query: string) {
  return prisma.note.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })
}
