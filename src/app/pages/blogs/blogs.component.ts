import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, NavbarComponent],  //
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
  



export class BlogsComponent {
  constructor() {}
}

