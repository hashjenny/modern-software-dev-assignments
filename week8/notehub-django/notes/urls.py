from django.urls import path

from . import views

urlpatterns = [
    path("", views.note_list, name="note_list"),
    path("notes/", views.note_list, name="note_list_all"),
    path("notes/new/", views.note_create, name="note_create"),
    path("notes/<int:note_id>/", views.note_detail, name="note_detail"),
    path("notes/<int:note_id>/edit/", views.note_update, name="note_update"),
    path("notes/<int:note_id>/delete/", views.note_delete, name="note_delete"),
    path("search/", views.search, name="search"),
    path("categories/", views.category_list, name="category_list"),
    path("categories/new/", views.category_create, name="category_create"),
    path("categories/<int:category_id>/", views.category_detail, name="category_detail"),
    path("categories/<int:category_id>/delete/", views.category_delete, name="category_delete"),
]
