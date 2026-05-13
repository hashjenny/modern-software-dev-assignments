from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from .forms import CategoryForm, NoteForm
from .models import Category, Note


def note_list(request):
    notes = Note.objects.all().order_by("-created_at")
    return render(request, "notes/note_list.html", {"notes": notes})


def note_detail(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    return render(request, "notes/note_detail.html", {"note": note})


def note_create(request):
    if request.method == "POST":
        form = NoteForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("note_list")
    else:
        form = NoteForm()
    return render(request, "notes/note_form.html", {"form": form})


def note_update(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    if request.method == "POST":
        form = NoteForm(request.POST, instance=note)
        if form.is_valid():
            form.save()
            return redirect("note_detail", note_id=note.id)
    else:
        form = NoteForm(instance=note)
    return render(request, "notes/note_form.html", {"form": form})


def note_delete(request, note_id):
    note = get_object_or_404(Note, id=note_id)
    if request.method == "POST":
        note.delete()
        return redirect("note_list")
    return render(request, "notes/note_confirm_delete.html", {"note": note})


def search(request):
    query = request.GET.get("q", "")
    notes = (
        Note.objects.filter(Q(title__icontains=query) | Q(content__icontains=query))
        if query
        else []
    )
    return render(request, "notes/search_results.html", {"notes": notes, "query": query})


def category_list(request):
    categories = Category.objects.all().order_by("name")
    return render(request, "notes/category_list.html", {"categories": categories})


def category_create(request):
    if request.method == "POST":
        form = CategoryForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("category_list")
    else:
        form = CategoryForm()
    return render(request, "notes/category_form.html", {"form": form})


def category_detail(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    notes = category.notes.all().order_by("-created_at")
    return render(request, "notes/category_detail.html", {"category": category, "notes": notes})


def category_delete(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    if request.method == "POST":
        category.delete()
        return redirect("category_list")
    return render(request, "notes/category_delete.html", {"category": category})
