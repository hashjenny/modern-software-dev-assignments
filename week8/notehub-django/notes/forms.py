from django import forms

from .models import Category, Note


class NoteForm(forms.ModelForm):
    class Meta:
        model = Note
        fields = ["title", "content", "category"]
        widgets = {
            "title": forms.TextInput(
                attrs={"class": "border rounded px-3 py-2 w-full", "placeholder": "笔记标题"}
            ),
            "content": forms.Textarea(
                attrs={
                    "class": "border rounded px-3 py-2 w-full",
                    "rows": 6,
                    "placeholder": "笔记内容",
                }
            ),
            "category": forms.Select(attrs={"class": "border rounded px-3 py-2 w-full"}),
        }


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ["name"]
        widgets = {
            "name": forms.TextInput(
                attrs={"class": "border rounded px-3 py-2 w-full", "placeholder": "分类名称"}
            ),
        }
