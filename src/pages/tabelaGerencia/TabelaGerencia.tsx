import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import Chart from 'react-apexcharts';
import { ApexOptions } from "apexcharts";
import { FaArrowRightArrowLeft, FaPen } from "react-icons/fa6";
import { Table } from "../../components/table/table";
import { TableHeader } from "../../components/table/table-header";
import { TableRow } from "../../components/table/table-row";
import { TableCell } from "../../components/table/table-cell";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import Usuario from "../../models/Usuario";
import { IoArrowBackSharp } from "react-icons/io5";
import { AuthContext } from "../../contexts/AuthContext";
import { buscar } from "../../services/Service";
import { ToastAlerta } from "../../utils/ToastAlerta";
import noPicture from '../../assets/img/noPicture.png';
import { IconButton } from "../../components/table/icon-button";
import { RotatingLines } from "react-loader-spinner";
import { FaLongArrowAltUp } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import Select from 'react-select';

interface FilterOptions {
  [key: string]: boolean;
}

interface OptionType {
  value: string;
  label: string;
}

export default function TabelaGerencia() {
  const navigate = useNavigate();
  window.scrollTo(0, 0);
  const [listaUsuarios, setListaUsuarios] = useState<Usuario[]>([])
  const { usuario, handleLogout, isAuthLoading } = useContext(AuthContext)
  const token = usuario?.token

  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([])
  const [busca, setBusca] = useState('')
  const [totalCargos, setTotalCargos] = useState(0)
  const [isCharLoading, setIsCharLoading] = useState(true)

  const [chartDataDepartamento, setchartDataDepartamento] = useState<{
    series: ApexNonAxisChartSeries;
    options: ApexOptions;
  }>({
    series: [0],
    options: {
      chart: {
        width: 380,
        type: 'pie',
      },
      labels: [''],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            fontSize: '10px',
            position: 'bottom'
          }
        }
      }]
    },
  });

  const [chartDataMediaSalario, setchartDataMediaSalario] = useState<{
    series: ApexAxisChartSeries;
    options: ApexOptions;
  }>({
    series: [{
      data: [0]
    }],
    options: {
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: [''],
      }
    },
  });

  const [filtrosCargo, setFiltrosCargo] = useState<FilterOptions>({});
  const [filtrosDepartamento, setFiltrosDepartamento] = useState<FilterOptions>({});

  async function buscarCargos() {
    try {
      await buscar('/usuario', (res: Usuario[]) => {
        setListaUsuarios(res);
        setUsuariosFiltrados(res);

        const nomesCargos = Array.from(new Set(res.map(user => user.cargo?.nome).filter(Boolean)));
        const nomesDepartamentos = Array.from(new Set(res.map(user => user.cargo?.departamento?.nome).filter(Boolean)));

        const filtrosIniciaisCargo: FilterOptions = {};
        const filtrosIniciaisDep: FilterOptions = {};

        nomesCargos.forEach(nome => filtrosIniciaisCargo[nome] = false);
        nomesDepartamentos.forEach(nome => filtrosIniciaisDep[nome] = false);

        setFiltrosCargo(filtrosIniciaisCargo);
        setFiltrosDepartamento(filtrosIniciaisDep);
      }, {
        headers: { Authorization: token }
      });
    } catch (error: any) {
      if (error.toString().includes('403')) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isAuthLoading) {
      if (!token) {
        ToastAlerta('Você precisa estar logado!', 'info')
        navigate('/')
      }
      else {
        buscarCargos()
      }
    }
  }, [isAuthLoading, token])


  useEffect(() => {
    const resultado = listaUsuarios.filter(user =>
      user.nome.toLowerCase().includes(busca.toLowerCase()) ||
      user.usuario?.toLowerCase().includes(busca.toLowerCase()) ||
      user.cargo?.nome?.toLowerCase().includes(busca.toLowerCase())
    )
    setUsuariosFiltrados(resultado)
  }, [busca, listaUsuarios])

  // --------------------

  useEffect(() => {
    if (listaUsuarios.length === 0) return;

    const agrupados = listaUsuarios.reduce((acc: Record<string, number>, user) => {
      const nomeDep = user.cargo?.departamento?.nome || 'Não Atribuído';
      acc[nomeDep] = (acc[nomeDep] || 0) + 1;
      return acc;
    }, {});

    const salariosPorDepartamento: Record<string, { total: number; quantidade: number }> = {};

    listaUsuarios.forEach((usuario) => {
      const nomeDep = usuario.cargo?.departamento?.nome || 'Não Atribuído';
      const salario = Number(usuario.cargo?.salario) || 0;

      if (!salariosPorDepartamento[nomeDep]) {
        salariosPorDepartamento[nomeDep] = { total: 0, quantidade: 0 };
      }

      salariosPorDepartamento[nomeDep].total += salario;
      salariosPorDepartamento[nomeDep].quantidade += 1;
    });

    const categorias = Object.keys(salariosPorDepartamento);
    const medias = categorias.map((dep) => {
      const { total, quantidade } = salariosPorDepartamento[dep];
      return parseFloat((total / quantidade).toFixed(2)); // Média com 2 casas
    });

    const cargosUnicos = new Set(listaUsuarios.map(u => u.cargo?.nome).filter(Boolean));
    setTotalCargos(cargosUnicos.size);

    setchartDataDepartamento({
      series: Object.values(agrupados),
      options: {
        ...chartDataDepartamento.options,
        labels: Object.keys(agrupados),
      },
    });

    setchartDataMediaSalario({
      series: [
        {
          data: medias
        }
      ],
      options: {
        ...chartDataMediaSalario.options,
        xaxis: {
          categories: categorias
        },
      },
    });

    setIsCharLoading(false)
  }, [listaUsuarios]);

  useEffect(() => {
    aplicarFiltros();
  }, [busca, filtrosCargo, filtrosDepartamento, listaUsuarios]);

  function aplicarFiltros() {
    const cargosSelecionados = Object.keys(filtrosCargo).filter((nome) => filtrosCargo[nome]);
    const departamentosSelecionados = Object.keys(filtrosDepartamento).filter((nome) => filtrosDepartamento[nome]);

    const resultado = listaUsuarios.filter(user => {
      const nomeMatch = user.nome.toLowerCase().includes(busca.toLowerCase());
      const usuarioMatch = user.usuario.toLowerCase().includes(busca.toLowerCase());
      const cargoMatch = user.cargo?.nome?.toLowerCase().includes(busca.toLowerCase());

      const cargoSelecionadoMatch = cargosSelecionados.length === 0 || cargosSelecionados.includes(user.cargo?.nome);
      const depSelecionadoMatch = departamentosSelecionados.length === 0 || departamentosSelecionados.includes(user.cargo?.departamento?.nome);

      return (nomeMatch || usuarioMatch || cargoMatch) && cargoSelecionadoMatch && depSelecionadoMatch;
    });

    setUsuariosFiltrados(resultado);
  }

  function handleSelectCargo(options: OptionType[]) {
    const novoFiltro: FilterOptions = {};
    Object.keys(filtrosCargo).forEach(c => novoFiltro[c] = false);
    options.forEach(opt => novoFiltro[opt.value] = true);
    setFiltrosCargo(novoFiltro);
  }

  function handleSelectDepartamento(options: OptionType[]) {
    const novoFiltro: FilterOptions = {};
    Object.keys(filtrosDepartamento).forEach(d => novoFiltro[d] = false);
    options.forEach(opt => novoFiltro[opt.value] = true);
    setFiltrosDepartamento(novoFiltro);
  }

  const opcoesCargo: OptionType[] = Object.keys(filtrosCargo).map((cargo) => ({ value: cargo, label: cargo }));
  const opcoesDepartamento: OptionType[] = Object.keys(filtrosDepartamento).map((dep) => ({ value: dep, label: dep }));


  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-screen w-full">
      <RotatingLines
        strokeColor="grey"
        strokeWidth="5"
        animationDuration="0.75"
        width="80"
        visible={true}
      />
    </div>;
  }

  if (!usuario?.token) {
    return null;
  }

  return (
    <div className="w-full p-6">

      <div className="flex flex-col">
        <div className="flex gap-3 ml-1 mb-2 items-center">
          <Link to="/home" className="flex items-center rounded-full gap-2 hover:bg-gray-200 p-4 hover:-translate-x-2 transition-all duration-300">
            <IoArrowBackSharp className="w-7 h-7" />
          </Link>
          <h3 className="text-lg font-medium text-rh-primarygrey">
            Colaboradores
          </h3>
        </div>
        <div className="w-full">
          <div className='flex items-center px-3 py-2 border border-gray-600 rounded-lg text-sm w-full  gap-4 mb-2'>
            <Search className='size-5 text-rh-primarygrey' />
            <input
              type='text'
              placeholder='Buscar colaborador...'
              className='bg-transparent flex-1 outline-none border-0 p-0 text-sm focus:ring-0'
              onChange={(e) => setBusca(e.target.value)}
              autoComplete='off'
              value={busca}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="w-full sm:w-1/2">
              <label className="font-semibold block mb-1 text-rh-primarygrey">Filtrar por Cargo</label>
              <Select
                isMulti
                options={opcoesCargo}
                placeholder="Selecione os cargos"
                onChange={handleSelectCargo}
                className="text-sm"
              />
            </div>
            <div className="w-full sm:w-1/2">
              <label className="font-semibold block mb-1 text-rh-primarygrey">Filtrar por Departamento</label>
              <Select
                isMulti
                options={opcoesDepartamento}
                placeholder="Selecione os departamentos"
                onChange={handleSelectDepartamento}
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* <div className='flex flex-col gap-4 px-12 py-4'> */}
      <div className="flex flex-wrap gap-3 w-full bg-gray-200 mb-4 rounded-lg p-3">
        <div className="flex-1 flex flex-col items-center p-2 bg-white rounded">
          <h3 className="text-sm font-bold text-center">Total de colaboradores</h3>
          {
            isCharLoading ?
              <div className="w-full h-60 flex justify-center items-center">
                <RotatingLines
                  strokeColor="grey"
                  strokeWidth="5"
                  animationDuration="0.75"
                  width="24"
                  visible={true}
                />
              </div>
              :
              <div className="h-60 flex flex-col justify-center items-center">
                <h2 className="text-4xl font-bold text-gray-800 mb-6">{listaUsuarios.length}</h2>
                <div className="flex">
                  <div className="flex-1 border-r flex flex-col items-center">
                    <div className="flex items-center gap-0.5 text-green-700 bg-green-300 rounded-full p-0.5 w-14 justify-center px-1 text-xs"><FaLongArrowAltUp /> 17,7%</div>
                    <p className="text-xs text-gray-500 mt-2">A mais que no mês anterior</p>
                  </div>
                  <div className="flex-1 pl-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <FaArrowRightArrowLeft className="h-7 w-7 p-2 rounded-full bg-blue-300 text-blue-500" />
                      <p className="text-xs text-gray-500">Houve 10 mudanças de cargos</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MdGroups className="h-7 w-7 p-1.5 rounded-full bg-blue-300 text-blue-500" />
                      <p className="text-xs text-gray-500">{totalCargos} Cargos no geral</p>
                    </div>
                  </div>
                </div>
              </div>
          }
        </div>
        <div className="flex-1 flex flex-col items-center p-2 bg-white rounded">
          <h3 className="text-sm font-bold text-center">Distribuição dos colaboradores por departamento</h3>
          {
            isCharLoading ?
              <div className="w-full h-60 flex justify-center items-center">
                <RotatingLines
                  strokeColor="grey"
                  strokeWidth="5"
                  animationDuration="0.75"
                  width="24"
                  visible={true}
                />
              </div>
              :
              <div className="w-full h-60 flex justify-center items-center">
                <Chart
                  options={chartDataDepartamento.options}
                  series={chartDataDepartamento.series}
                  type="pie"
                  height={200}
                />
              </div>
          }
        </div>
        <div className="flex-1 flex flex-col items-center p-2 bg-white rounded">
          <h3 className="text-sm font-bold text-center">Média salarial por departamento</h3>
          {
            isCharLoading ?
              <div className="w-full h-60 flex justify-center items-center">
                <RotatingLines
                  strokeColor="grey"
                  strokeWidth="5"
                  animationDuration="0.75"
                  width="24"
                  visible={true}
                />
              </div>
              :
              <div className="w-full h-60 flex justify-center items-center">
                <Chart
                  options={chartDataMediaSalario.options}
                  series={chartDataMediaSalario.series}
                  type="bar"
                  height={200}
                />
              </div>
          }
        </div>
      </div>

      <Table >
        <thead>
          <tr className='border-b border-gray-200 text-gray-500'>
            <TableHeader>Colaborador</TableHeader>
            <TableHeader>Cargo</TableHeader>
            <TableHeader>Departamento</TableHeader>
            <TableHeader>Salario</TableHeader>
            <TableHeader style={{ width: 64 }}>Editar</TableHeader>
          </tr>
        </thead>
        <tbody className="bg-white">
          {usuariosFiltrados.map((user) => {
            return (
              <TableRow key={user.id}>
                <TableCell className="flex gap-3 items-center">
                  <img src={user.foto?.length > 10 ? user.foto : noPicture} alt="foto do usuario" className="w-9 h-9 border-2 border-gray-700 rounded-full" />
                  <div className='flex flex-col gap-1'>
                    <span className='font-semibold text-whitek'>
                      {user.nome}
                    </span>
                    <span className="text-xs">{user.usuario}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col gap-1'>
                    <span>{user.cargo?.nome}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex flex-col gap-1'>
                    <span>{user.cargo?.departamento?.nome}</span>
                  </div>
                </TableCell>
                <TableCell>{user.cargo?.salario.toLocaleString("pt-br", { style: "currency", currency: "BRL" })}</TableCell>
                <TableCell>
                  <Link to={`/editar-perfil/${user.id}`} className="flex items-center justify-center w-9 h-9 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                    <FaPen />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <TableCell colSpan={3}>
              {/* Mostrando {attendees.length} de {total} itens */}
            </TableCell>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
}
