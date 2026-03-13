import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';


const routes: Routes = [
  { path: '', component: HomeComponent }, 
  {path: 'contacto', component: ContactoComponent}, 
  {path: 'blogs', component: BlogsComponent}, 
  {path: 'proyectos', component: ProyectosComponent}, 
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }
