import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    {path: 'contacto', component: ContactoComponent},
    {path: 'blogs', component: BlogsComponent}, 
    {path: 'proyectos', component: ProyectosComponent}, 
];
