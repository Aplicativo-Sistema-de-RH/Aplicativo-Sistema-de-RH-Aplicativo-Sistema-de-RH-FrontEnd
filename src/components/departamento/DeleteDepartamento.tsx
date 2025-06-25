import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import Departamento from '../../models/Departamento';
import { ToastAlerta } from '../../utils/ToastAlerta';
import { buscar, deletar } from '../../services/Service';
import LogoDepartamento from "../../assets/img/LogoDepartamento.png";
import ConfirmModal from "../confirmmodal/ConfirmModal";


function DeleteDepartamento() {

  const navigate = useNavigate();

  const [departamento, setDepartamento] = useState<Departamento>({} as Departamento)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [showModal, setShowModal] = useState(false);


  const { usuario, handleLogout } = useContext(AuthContext)
  const token = usuario.token

  const { id } = useParams<{ id: string }>();
  const { descricao } = useParams<{ descricao: string }>();

  async function buscarPorId(id: string) {
    try {
      await buscar(`/departamento/${id}`, setDepartamento, {
        headers: { Authorization: token }
      })
    } catch (error: any) {
      if (error.toString().includes('403')) {
        handleLogout()
      }
    }
  }

  useEffect(() => {
    if (token === '') {
      ToastAlerta('Você precisa estar logado!', 'info')
      navigate('/')
    }
  }, [token])

  useEffect(() => {
    if (id !== undefined) {
      buscarPorId(id)
    }
  }, [id])


  async function deletarDepartamento() {
    setIsLoading(true)

    try {
      await deletar(`/departamento/${id}`, {
        headers: {
          'Authorization': token
        }
      })

      ToastAlerta('Departamento apagado com sucesso', 'sucesso')

    } catch (error: any) {
      if (error.toString().includes('403')) {
        handleLogout()
      } else {
        ToastAlerta('Erro ao deletar o departamento.', 'erro')
      }
    }

    setIsLoading(false)
    retornar()
  }


  function retornar() {
    navigate("/departamentos")
  }

  return (

    <div className='container w-1/3 mx-auto'>
      <h1 className='text-4xl text-center my-4'>Deletar Departamento</h1>
      <button
  onClick={() => setShowModal(true)}
  className="text-slate-100 bg-red-400 transition-colors duration-500 hover:bg-red-700 w-1/3 p-2 rounded flex items-center justify-center"
>
  Apagar
</button>

<ConfirmModal
  open={showModal}
  title="Tem certeza que deseja apagar o departamento?"
  onConfirm={() => {
    setShowModal(false);
    deletarDepartamento();
  }}
  onCancel={() => setShowModal(false)}
/>
    </div>
  )
}

export default DeleteDepartamento