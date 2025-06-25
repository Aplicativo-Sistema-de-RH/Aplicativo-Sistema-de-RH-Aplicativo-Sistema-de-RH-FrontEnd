import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RotatingLines } from "react-loader-spinner";
import ColunaEsquerda from "../../assets/img/ColunaEsquerda.png"
import ColunaDireita from "../../assets/img/ColunaDireita.png"
import Departamento from "../../models/Departamento";
import { AuthContext } from "../../contexts/AuthContext";
import { ToastAlerta } from "../../utils/ToastAlerta";
import { atualizar, buscar, cadastrar } from "../../services/Service";
import ConfirmModal from "../confirmmodal/ConfirmModal";

function FormDepartamento() {

  const navigate = useNavigate();

  const [departamento, setDepartamento] = useState<Departamento>(
    {} as Departamento
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingPage, setLoadingPage] = useState(true);

  const { usuario, handleLogout } = useContext(AuthContext);
  const token = usuario.token;
  const [mostrarModal, setMostrarModal] = useState(false);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (token === "") {
      return;
    }
    if (!token) {
      ToastAlerta("Você precisa estar Logado!", "info");
      handleLogout();
      navigate("/");
    } else {
      if (id !== undefined) {
        buscar(`/departamento/${id}`, (data: Departamento) => {
          const numeroAndar = parseInt(data.andar);
          setDepartamento({ ...data, andar: numeroAndar.toString() });
        }, {
          headers: { Authorization: token },
        });
      }
      setLoadingPage(false);
    }
  }, [token]);

  function atualizarEstado(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setDepartamento({
      ...departamento,
      [e.target.name]: e.target.value,
    });
  }

  function retornar() {
    navigate("/departamentos");
  }

  async function gerarNovoDepartamento(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    console.log("ID do departamento:", id);




    if (id !== undefined) {
      try {
        const departamentoCorreto = {
          ...departamento,
          andar: `${parseInt(departamento.andar)}° Andar`,
        }
        await atualizar(`/departamento`, departamentoCorreto, setDepartamento, {
          headers: { Authorization: token },
        });
        ToastAlerta("O Departamento foi atualizado com sucesso!", "sucesso");
      } catch (error: any) {
        if (error.toString().includes("403")) {
          handleLogout();
        } else {
          ToastAlerta("Erro ao atualizar o Departamento.", "erro");
        }
      }
    } else {
      try {
        const departamentoCorreto = {
          ...departamento,
          andar: `${departamento.andar}° Andar`,
        }
        await cadastrar(`/departamento`, departamentoCorreto, setDepartamento, {
          headers: { Authorization: token },
        });
        ToastAlerta("O Departamento foi cadastrado com sucesso!", "sucesso");
      } catch (error: any) {
        if (error.toString().includes("403")) {
          handleLogout();
        } else {
          ToastAlerta("Erro ao cadastrar o Departamento.", "erro");
        }
      }
    }

    setIsLoading(false);
    retornar();
  }

  if (loadingPage) {
    return (
      <RotatingLines
        strokeColor="black"
        strokeWidth="5"
        animationDuration="0.75"
        width="24"
        visible={true}
      />
    );
  }

  return (

    <>
      <div className="flex min-h-screen relative justify-between">
        <img className="sticky h-screen " src={ColunaEsquerda} alt="Coluna Esquerda" />
        <div className="flex flex-col gap-4 p-4">

          <h1 className="text-4xl text-center my-8 text-rh-primaryblue">
            {id === undefined
              ? "Cadastrar Departamento"
              : "Editar Departamento"}
          </h1>

          <form
            className="flex flex-col gap-4 "
            onSubmit={gerarNovoDepartamento}
          >
            <div className="flex flex-col gap-2 focus:ring-2 ">
              <label className="text-rh-secondaryblue" htmlFor="nome">Nome do Departamento</label>
              <input
                type="text"
                placeholder="Escreva o nome do Departamento"
                name="nome"
                className="w-full p-2 rounded border-2 border-rh-primarygrey focus:border-rh-primarypurple focus:ring-2 focus:ring-rh-primarypurple outline-none text-shadow-rh-primarygrey"
                value={departamento.nome}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  atualizarEstado(e)
                }
              />

              <label className="text-rh-secondaryblue" htmlFor="andar">Andar</label>
              <input
                type="number"
                placeholder="Digite o numero do andar do Departamento"
                name="andar"
                className="w-full p-2 rounded border-2 border-rh-primarygrey focus:border-rh-primarypurple focus:ring-2 focus:ring-rh-primarypurple outline-none text-shadow-rh-primarygrey"
                value={departamento.andar}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  atualizarEstado(e)
                }
              />
              <label className="text-rh-secondaryblue" htmlFor="ramal">Ramal</label>
              <input
                type="text"
                placeholder="Por Ex: 123"
                name="ramal"
                className="w-full p-2 rounded border-2 border-rh-primarygrey focus:border-rh-primarypurple focus:ring-2 focus:ring-rh-primarypurple outline-none text-shadow-rh-primarygrey"
                value={departamento.ramal}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  atualizarEstado(e)
                }
              />

              <label className="text-rh-secondaryblue" htmlFor="descricao">Descrição do Departamento</label>
              <textarea

                placeholder="Descreva aqui seu Departamento"
                name="descricao"
                className="resize-none h-20 w-full p-2 rounded border-2 border-rh-primarygrey focus:border-rh-primarypurple focus:ring-2 focus:ring-rh-primarypurple outline-none text-shadow-rh-primarygrey"
                value={departamento.descricao}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  atualizarEstado(e)
                }
              />



            </div>
            <div className="flex justify-between pb-[20px] pt-[10px]">
              <button
  type="button"
  onClick={() => setMostrarModal(true)}
  className="rounded text-slate-100 bg-rh-primarypurple transition-colors duration-500 hover:bg-rh-secondarypurple w-[150px] py-2 flex justify-center"
>
  {isLoading ? (
    <RotatingLines
      strokeColor="white"
      strokeWidth="5"
      animationDuration="0.75"
      width="24"
      visible={true}
    />
  ) : (
    <span>{id === undefined ? "Cadastrar" : "Atualizar"}</span>
  )}
</button>
                {isLoading ? (
                  <RotatingLines
                    strokeColor="white"
                    strokeWidth="5"
                    animationDuration="0.75"
                    width="24"
                    visible={true}
                  />
                ) : (
                  <span>{id === undefined ? "Cadastrar" : "Atualizar"}</span>
                )}




              <Link to="/departamentos"
                className="rounded text-slate-100 bg-rh-primarygrey
                                    transition-colors hover:bg-rh-secondaryblue duration-500 w-[150px] py-2  flex justify-center"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>

        <img className="sticky h-screen" src={ColunaDireita} alt="Coluna Direita" />

      </div>

      <ConfirmModal
  open={mostrarModal}
  title={id === undefined ? "Tem certeza que deseja cadastrar?" : "Tem certeza que deseja atualizar?"}
  onConfirm={(e) => {
    setMostrarModal(false);
    const fakeEvent = { preventDefault: () => {} } as React.ChangeEvent<HTMLFormElement>;
    gerarNovoDepartamento(fakeEvent); // ou melhor ainda: separar função para executar sem event
  }}
  onCancel={() => setMostrarModal(false)}
/>
    </>
  );
}

export default FormDepartamento;
