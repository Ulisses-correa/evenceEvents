import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


interface Funcionario {
  nome: string;
  funcao: string;
  frase: string;
  imagem: string;
}

@Component({
  selector: 'app-ianes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ianes.component.html',
  styleUrl: './ianes.component.css'
})
export class IanesComponent implements OnInit {
  ngOnInit() {
    console.log('IanesComponent loaded');
  }
  funcionarios: Funcionario[] = [
    { nome: 'Guilherme Zermiani', funcao: 'Designer UI/UX', frase: 'O sucesso não vêm do nada, mas sim da iniciativa de dar o primeiro passo.', imagem: 'fotos-ianes/guilherme.png' },

    { nome: 'Kenia Branger', funcao: 'Menina do Cafezinho', frase: '#feliz no simples', imagem: 'fotos-ianes/kenia.png' },

    { nome: 'Kevin José S. Knoll', funcao: 'Desenvolvedor Full-Stack', frase: 'nunca deixe para amanha o que pode ser feito hoje.', imagem: 'fotos-ianes/kevin.png' },

    { nome: 'Marlon Fernandes Garcia', funcao: 'Auxiliar Geral', frase: 'se não agora, quando?', imagem: 'fotos-ianes/marlom.png' },

    { nome: 'Nathaly Cristina Carvalho Ruthes', funcao: 'Especialista em QA', frase: 'Nunca deixe para amanha o que pode ser feito hoje', imagem: 'fotos-ianes/natalie.png' },

    { nome: 'Ulisses correa filho', funcao: 'Scrum Master', frase: 'Você tem poder apenas da sua mente interna, não sobre os eventos externos', imagem: 'fotos-ianes/ulisses.png' }
  ];
}
