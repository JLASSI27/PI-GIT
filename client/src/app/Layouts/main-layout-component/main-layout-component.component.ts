import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NavbarComponent} from "../navbar/navbar.component";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-main-layout-component',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterOutlet],
  templateUrl: './main-layout-component.component.html',
  styleUrls: ['./main-layout-component.component.css']
})
export class MainLayoutComponentComponent {

}
