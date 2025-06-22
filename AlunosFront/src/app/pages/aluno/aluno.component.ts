import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface Aluno {
  id_aluno: number;
  nome: string;
  email: string;
  telefone: string;
  id_curso: number;
}

@Component({
  selector: 'app-aluno',
  templateUrl: './aluno.component.html',
  styleUrls: ['./aluno.component.css'],
})
export class AlunoComponent implements OnInit {
  alunoForm: FormGroup;
  alunos: Aluno[] = [];
  isEditing: boolean = false;
  editingAlunoId: number | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.alunoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
      id_curso: ['', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]],
    });
  }

  ngOnInit(): void {
    this.loadAlunos();
  }

  loadAlunos(): void {
    this.http.get<Aluno[]>('http://127.0.0.1:8000/api/alunos/').subscribe({
      next: (data) => {
        this.alunos = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar alunos:', err);
        alert('Erro ao carregar a lista de alunos.');
      },
    });
  }

  onSubmit(): void {
    if (this.alunoForm.valid) {
      const formData = {
        nome: this.alunoForm.value.nome,
        email: this.alunoForm.value.email,
        telefone: this.alunoForm.value.telefone,
        id_curso: Number(this.alunoForm.value.id_curso),
      };

      if (this.isEditing && this.editingAlunoId) {
        // Atualizar aluno (PUT)
        this.http
          .put(
            `http://127.0.0.1:8000/api/alunos/${this.editingAlunoId}/`,
            formData,
            {
              headers: { 'Content-Type': 'application/json' },
            }
          )
          .subscribe({
            next: () => {
              alert('Aluno atualizado com sucesso!');
              this.alunoForm.reset();
              this.isEditing = false;
              this.editingAlunoId = null;
              this.loadAlunos();
            },
            error: (err: HttpErrorResponse) => {
              this.handleError(err, 'Erro ao atualizar aluno');
            },
          });
      } else {
        // Cadastrar aluno (POST)
        this.http
          .post('http://127.0.0.1:8000/api/alunos/', formData, {
            headers: { 'Content-Type': 'application/json' },
          })
          .subscribe({
            next: (res: any) => {
              alert(`Aluno cadastrado com sucesso! ID: ${res.id_aluno}`);
              this.alunoForm.reset();
              this.loadAlunos();
            },
            error: (err: HttpErrorResponse) => {
              this.handleError(err, 'Erro ao cadastrar aluno');
            },
          });
      }
    }
  }

  editAluno(aluno: Aluno): void {
    this.isEditing = true;
    this.editingAlunoId = aluno.id_aluno;
    this.alunoForm.patchValue({
      nome: aluno.nome,
      email: aluno.email,
      telefone: aluno.telefone,
      id_curso: aluno.id_curso,
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingAlunoId = null;
    this.alunoForm.reset();
  }

  deleteAluno(id: number): void {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
      this.http.delete(`http://127.0.0.1:8000/api/alunos/${id}/`).subscribe({
        next: () => {
          alert('Aluno excluído com sucesso!');
          this.loadAlunos();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Erro ao excluir aluno:', err);
          alert('Erro ao excluir aluno.');
        },
      });
    }
  }

  private handleError(err: HttpErrorResponse, defaultMsg: string): void {
    console.error('Erro completo:', err);
    if (err.status === 0) {
      alert(
        'Erro de conexão com o servidor. Verifique se o servidor está rodando e o CORS está configurado.'
      );
    } else if (err.error) {
      let errorMsg = defaultMsg + ':';
      if (err.error.id_curso) {
        errorMsg += `\nCurso: ${err.error.id_curso.join(', ')}`;
      }
      if (err.error.nome) {
        errorMsg += `\nNome: ${err.error.nome.join(', ')}`;
      }
      alert(errorMsg);
    } else {
      alert(`${defaultMsg}: ${err.status} - ${err.message}`);
    }
  }
}
