import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Hourglass, RotatingLines } from 'react-loader-spinner'
import colbgleft from "../../assets/img/colbgleft.png"
import colbgright from "../../assets/img/colbgright.png"
import Cargo from '../../models/Cargo'
import { AuthContext } from '../../contexts/AuthContext'
import { buscar, deletar } from '../../services/Service'
import { ToastAlerta } from '../../utils/ToastAlerta'
import ConfirmModal from '../confirmmodal/ConfirmModal'


export default function DeletarCargo() {
  const navigate = useNavigate()
  const [cargo, setCargo] = useState<Cargo>({} as Cargo)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loadingPage, setLoadingPage] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const { usuario, handleLogout } = useContext(AuthContext)
  const token = usuario.token

  const { id } = useParams<{ id: string }>()

  async function buscarPorId(id: string) {
    try {
      await buscar(`/cargo/${id}`, setCargo, {
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
      ToastAlerta('Você precisa estar logado', 'info')
      navigate('/')
    }
  }, [token])

  useEffect(() => {
    if (token === '') return
    if (!token) {
      ToastAlerta('Você precisa estar logado!', 'info')
      handleLogout()
      navigate('/')
    } else {
      if (id !== undefined) {
        buscarPorId(id)
      }
      setLoadingPage(false)
    }
  }, [token, id])

  async function deletarCargo() {
    setIsLoading(true)

    try {
      await deletar(`/cargo/${id}`, {
        headers: {
          'Authorization': token
        }
      })

      ToastAlerta("Cargo apagado com sucesso", "sucesso")
    } catch (error: any) {
      if (error.toString().includes('403')) {
        handleLogout()
      } else {
        ToastAlerta("Erro ao deletar o cargo.", "erro")
      }
    }

    setIsLoading(false)
    retornar()
  }

  function retornar() {
    navigate("/home")
  }

  if (loadingPage) {
    return <Hourglass
      visible={true}
      height="80"
      width="80"
      ariaLabel="hourglass-loading"
      wrapperStyle={{}}
      wrapperClass=""
      colors={['#306cce', '#72a1ed']}
    />
  }

  return (
    <div className="flex min-h-screen relative justify-between">
      <img src={colbgleft} alt="decorativo" className="sticky top-0 h-screen" />

      <div className="flex items-center flex-col gap-4 p-4">
        <div className='my-2 flex flex-col gap-2 items-center'>
          <h2 className="text-5xl text-gray-800">
            Removendo Cargo
          </h2>
          <p className='text-gray-600'>Você tem certeza que deseja remover o registro desse cargo?</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="w-full flex flex-col gap-2">
              <label htmlFor="nome" className="w-full pl-3 text-sm font-normal">Nome do Cargo</label>
              <input
                className="w-full rounded-sm text-rh-primarygrey border bg-white px-3 py-2"
                type="text"
                value={cargo.nome}
                disabled
              />
            </div>
            <div className="w-full flex flex-col gap-2">
              <label htmlFor="nivel" className="w-full pl-3 text-sm font-normal">Nivel do Cargo</label>
              <input
                className="w-full rounded-sm text-rh-primarygrey border bg-white px-3 py-2"
                type="text"
                value={cargo.nivel}
                disabled
              />
            </div>
            <div>
              <label htmlFor="salario" className="w-full pl-3 text-sm font-normal">Salario do Cargo</label>
              <input
                className="w-full rounded-sm text-rh-primarygrey border bg-white px-3 py-2"
                type="number"
                value={cargo.salario}
                disabled
              />
            </div>
            <div>
              <label htmlFor="descricao" className="w-full pl-3 text-sm font-normal">Descrição do Cargo</label>
              <textarea
                value={cargo.descricao}
                className="w-full resize-none rounded-sm text-rh-primarygrey border bg-white px-3 py-2"
                disabled
              ></textarea>
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor="departamento" className="w-full pl-3 text-sm font-normal">Departamento</label>
              <select
                value={cargo.departamento?.id || ""}
                className="w-full rounded-sm text-rh-primarygrey border bg-white px-3 py-2"
                disabled
              >
                <option value="" disabled>Selecione um departamento</option>
                {cargo.departamento && (
                  <option value={cargo.departamento.id}>
                    {cargo.departamento.nome}
                  </option>
                )}
              </select>
            </div>

            <div className='flex gap-2 mt-6'>
              <button
                className="flex justify-center items-center w-full rounded-sm px-3 py-2 font-medium text-white bg-rh-secondary-red hover:bg-red-500"
                onClick={() => setShowModal(true)}
              >
                {isLoading ?
                  <RotatingLines
                    strokeColor="white"
                    strokeWidth="5"
                    animationDuration="0.75"
                    width="24"
                    visible={true}
                  /> :
                  <span>Remover</span>
                }
              </button>

              <button
                onClick={() => retornar()}
                className="rounded text-slate-100 bg-gray-800 hover:bg-gray-900 w-full py-2 mx-auto flex justify-center"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <img src={colbgright} alt="decorativo" className="sticky top-0 h-screen" />
      <ConfirmModal
        open={showModal}
        title="Tem certeza que deseja apagar este cargo?"
        onConfirm={() => {
          setShowModal(false)
          deletarCargo()
        }}
        onCancel={() => setShowModal(false)}
      />
    </div>
  )
}
