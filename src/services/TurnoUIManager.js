export class TurnoUIManager {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.diasDisponibles = [];
        this.horarioEspecialista = null;
        this.turnoService = null;
        this.isUpdating = false;
    }

    init(turnoService) {
        this.turnoService = turnoService;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('especialistaSelect')?.addEventListener('change', (e) => this.handleEspecialistaChange(e));
        document.getElementById('especialidadSelect')?.addEventListener('change', (e) => this.handleEspecialidadChange(e));
        document.getElementById('prevMonth')?.addEventListener('click', () => this.handlePrevMonth());
        document.getElementById('nextMonth')?.addEventListener('click', () => this.handleNextMonth());
    }

    setDiasDisponibles(dias) {
        this.diasDisponibles = dias;
    }

    setHorarioEspecialista(horario) {
        this.horarioEspecialista = horario;
    }

    getHorarioEspecialista() {
        return this.horarioEspecialista;
    }

    async cargarHorariosEspecialista(especialistaId) {
        const { data: horarios, error } = await this.turnoService.getHorariosEspecialista(especialistaId);
        if (error) throw error;

        const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const diasDisponibles = horarios.map(h => diasSemana[h.dia_semana - 1]);

        this.setDiasDisponibles(diasDisponibles);
        this.setHorarioEspecialista(horarios);
        this.generarDiasCalendario();
    }

    async cargarEspecialistas(especialidadId = null) {
        const { data: especialistas, error } = await this.turnoService.getEspecialistas(especialidadId);
        if (error) throw error;
        this.actualizarSelectEspecialistas(especialistas);
    }

    async cargarEspecialidades() {
        const { data: especialidades, error } = await this.turnoService.getEspecialidades();
        if (error) throw error;
        this.actualizarSelectEspecialidades(especialidades);
    }

    esDiaDisponible(fecha) {
        if (!this.diasDisponibles.length) {
            return false;
        }
        const nombreDia = this.turnoService.obtenerNombreDia(fecha);
        return this.diasDisponibles.includes(nombreDia);
    }

    generarDiasCalendario() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const firstDayIndex = firstDay.getDay();
        const lastDay = new Date(year, month + 1, 0);
        const lastDate = lastDay.getDate();

        const calendar = document.getElementById('calendar-days');
        if (!calendar) return;

        calendar.innerHTML = '';
        
        // Agregar días vacíos hasta el primer día del mes
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendar.appendChild(emptyDay);
        }

        // Agregar los días del mes
        for (let day = 1; day <= lastDate; day++) {
            const dayElement = document.createElement('div');
            const fecha = new Date(year, month, day);
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            if (this.esDiaDisponible(fecha)) {
                dayElement.classList.add('disponible');
                dayElement.addEventListener('click', () => this.handleDayClick(day));
            }
            
            calendar.appendChild(dayElement);
        }

        // Actualizar el título del mes
        const monthTitle = document.getElementById('currentMonth');
        if (monthTitle) {
            const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            monthTitle.textContent = `${months[month]} ${year}`;
        }
    }

    async handleDayClick(day) {
        const fecha = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
        if (this.esDiaDisponible(fecha)) {
            this.mostrarFormularioTurno(fecha);
        }
    }

    async mostrarFormularioTurno(fecha) {
        if (!fecha || !this.horarioEspecialista) return;

        let diaSemana = fecha.getDay();
        diaSemana = diaSemana === 0 ? 7 : diaSemana;

        const horarioDia = this.horarioEspecialista.find(h => h.dia_semana === diaSemana);
        if (!horarioDia) return;

        this.mostrarModalHorarios(fecha, horarioDia);
    }

    async mostrarModalHorarios(fecha, horarioDia) {
        if (!fecha || !horarioDia) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Seleccionar Horario</h2>
                <div class="horarios-container">
                    <p>Fecha: ${fecha.toLocaleDateString()}</p>
                    <p>Horario: ${horarioDia.hora_inicio} - ${horarioDia.hora_fin}</p>
                    <button class="btn-confirmar">Confirmar Turno</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => document.body.removeChild(modal);

        window.onclick = (event) => {
            if (event.target === modal) {
                document.body.removeChild(modal);
            }
        };

        const confirmarBtn = modal.querySelector('.btn-confirmar');
        confirmarBtn.onclick = () => this.confirmarTurno(fecha, horarioDia);
    }    async confirmarTurno(fecha, horarioDia) {
        // Obtener los valores de los selectores
        const especialistaSelect = document.getElementById('especialistaSelect');
        const especialidadSelect = document.getElementById('especialidadSelect');
        
        if (!especialistaSelect.value || !especialidadSelect.value) {
            alert('Por favor, seleccione un especialista y una especialidad');
            return;
        }

        const turnoData = {
            pacienteId: localStorage.getItem('userId'), // Obtener el ID del usuario desde localStorage
            especialistaId: especialistaSelect.value,
            especialidadId: especialidadSelect.value,
            fecha: fecha.toISOString().split('T')[0],
            hora: horarioDia.hora_inicio,
            nombreDia: this.turnoService.obtenerNombreDia(fecha),
            mes: fecha.getMonth() + 1,
            año: fecha.getFullYear()
        };

        try {
            const { error } = await this.turnoService.crearTurno(turnoData);
            if (error) throw error;
            alert('Turno registrado exitosamente');
            document.querySelector('.modal')?.remove();
        } catch (error) {
            console.error('Error al registrar el turno:', error);
            alert('Error al registrar el turno: ' + error.message);
        }
    }

    actualizarSelectEspecialistas(especialistas) {
        const select = document.getElementById('especialistaSelect');
        select.innerHTML = '<option value="">Seleccione un especialista</option>';
        especialistas?.forEach(esp => {
            if (esp.persona) {
                const option = document.createElement('option');
                option.value = esp.id;
                option.textContent = `${esp.persona.nombre} ${esp.persona.apellido}`;
                select.appendChild(option);
            }
        });
    }

    actualizarSelectEspecialidades(especialidades) {
        const select = document.getElementById('especialidadSelect');
        select.innerHTML = '<option value="">Seleccione una especialidad</option>';
        especialidades?.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.id;
            option.textContent = esp.especialidad;
            select.appendChild(option);
        });
    }

    avanzarMes() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.generarDiasCalendario();
    }

    retrocederMes() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.generarDiasCalendario();
    }

    handlePrevMonth() {
        this.retrocederMes();
    }

    handleNextMonth() {
        this.avanzarMes();
    }

    async handleEspecialistaChange(e) {
        if (this.isUpdating) return;
        this.isUpdating = true;

        const especialistaId = e.target.value;
        if (especialistaId) {
            document.getElementById('especialidadSelect').value = '';
            await this.cargarHorariosEspecialista(especialistaId);
        }
        this.isUpdating = false;
    }    async handleEspecialidadChange(e) {
        if (this.isUpdating) return;
        this.isUpdating = true;

        const especialidadId = e.target.value;
        if (especialidadId) {
            await this.cargarEspecialistas(especialidadId);
        } else {
            await this.cargarEspecialistas();
        }
        this.generarDiasCalendario();
        this.isUpdating = false;
    }
}
