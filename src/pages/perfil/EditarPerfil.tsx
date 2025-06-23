import { useContext, useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { RotatingLines } from "react-loader-spinner";
import bgeditar1 from "../../assets/img/bgeditar1.png";
import bgeditar2 from "../../assets/img/bgeditar2.png";
import { AuthContext } from "../../contexts/AuthContext";
import Cargo from "../../models/Cargo";
import Usuario from "../../models/Usuario";
import { atualizar, buscar } from "../../services/Service";
import { ToastAlerta } from "../../utils/ToastAlerta";

export default function EditarPerfil() {
  const navigate = useNavigate();

  const { usuario, setUsuario, handleLogout } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [listaCargos, setListaCargos] = useState<Cargo[]>([]);

  const [usuarioEditar, setUsuarioEditar] = useState<Usuario>({
    id: Number(""),
    nome: "",
    usuario: "",
    senha: "",
    foto: "",
    cargo: null,
  });

  function atualizarEstado(e: ChangeEvent<HTMLInputElement>) {
    setUsuarioEditar({
      ...usuarioEditar,
      [e.target.name]: e.target.value,
    });
  }

  async function buscarUserPorId(id: string) {
    try {
      await buscar(
        `/usuario/${id}`,
        (data: any) => {
          const { id, nome, usuario, foto, cargo } = data;
          setUsuarioEditar({
            id,
            nome,
            usuario,
            senha: "",
            foto,
            cargo,
          });
        },
        {
          headers: {
            Authorization: usuario.token,
          },
        }
      );
    } catch (error: any) {
      if (error.toString().includes("403")) {
        handleLogout();
      }
    }
  }

  async function buscarCargo() {
    try {
      await buscar("/cargo", setListaCargos, {
        headers: { Authorization: usuario.token },
      });
    } catch (error: any) {
      if (error.toString().includes("403")) {
        handleLogout();
      }
    }
  }

  function retornar() {
    navigate("/login"); 
  }

  async function handleSubmit(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await atualizar("/usuario/atualizar", usuarioEditar, setUsuario, {
        headers: {
          Authorization: usuario.token,
        },
      });

      ToastAlerta("Dados atualizados com sucesso!", "sucesso");
      ToastAlerta("Por motivos de segurança o usuário foi deslogado", "info");

      handleLogout();
      setIsLoading(false);
      retornar(); 
    } catch (error) {
      ToastAlerta("Erro ao atualizar dados. Verifique os campos.", "error");
      setIsLoading(false);
    }
  }

  function atualizarCargo(e: ChangeEvent<HTMLSelectElement>) {
    const cargoId = parseInt(e.target.value);

    setUsuarioEditar({
      ...usuarioEditar,
      cargo: {
        id: cargoId,
      } as Cargo,
    });
  }

  useEffect(() => {
    if (usuario.token === "") {
      return;
    }

    if (!usuario.token) {
      ToastAlerta("Você precisa estar logado!", "info");
      handleLogout();
      navigate("/");
    } else {
      if (usuario.id) {
        buscarCargo();
        buscarUserPorId(String(usuario.id)).then(() => {
          setUsuarioEditar((prevData) => ({
            ...prevData,
            senha: "",
          }));
        });
      }
    }
  }, [usuario.token]);

  return (
    <div className="flex min-h-screen relative justify-between">
      <img src={bgeditar1} alt="decorativo" className="sticky top-0 h-screen" />

      <div className="w-full max-w-md m-auto px-4 my-6">
        <h2 className="font-medium text-4xl mb-8 text-center">Seus Dados</h2>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="block text-text mb-1" htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              name="nome"
              placeholder="Digite seu nome completo"
              className="w-full px-4 py-2 text-rh-primarygrey border border-border rounded focus:outline-none focus:ring-2 focus:ring-rh-primaryblue"
              value={usuarioEditar.nome}
              onChange={atualizarEstado}
            />
          </div>

          <div className="mb-2">
            <label className="block text-text mb-1" htmlFor="usuario">Email</label>
            <input
              type="email"
              id="usuario"
              name="usuario"
              placeholder="Exemplo@email.com"
              className="w-full px-4 py-2 text-rh-primarygrey border border-border rounded focus:outline-none focus:ring-2 focus:ring-rh-primaryblue"
              value={usuarioEditar.usuario}
              onChange={atualizarEstado}
            />
          </div>

          <div className="mb-2">
            <label className="block text-text mb-1" htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              placeholder="Mínimo 8 caracteres"
              className="w-full px-4 py-2 text-rh-primarygrey border border-border rounded focus:outline-none focus:ring-2 focus:ring-rh-primaryblue"
              value={usuarioEditar.senha}
              onChange={atualizarEstado}
            />
          </div>

          <div className="mb-2">
            <label className="block text-text mb-1" htmlFor="foto">Foto</label>
            <input
              type="text"
              id="foto"
              name="foto"
              placeholder="Coloque o link da foto aqui"
              className="w-full px-4 py-2 text-rh-primarygrey border border-border rounded focus:outline-none focus:ring-2 focus:ring-rh-primaryblue"
              value={usuarioEditar.foto}
              onChange={atualizarEstado}
            />
          </div>

          <div className="mb-2">
            <label className="block text-text mb-1" htmlFor="cargo">Cargo</label>
            <select
              required
              value={usuarioEditar.cargo?.id || ""}
              name="cargo"
              id="cargo"
              className="w-full rounded-sm text-rh-primarygrey border bg-white px-3 py-2 text-md focus:outline-none focus:ring-2 focus:ring-rh-primaryblue"
              onChange={atualizarCargo}
            >
              <option value="" disabled>Selecione um cargo</option>
              {listaCargos.map((cargo) => (
                <option key={cargo.id} value={cargo.id}>
                  {cargo.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center gap-6">
            <button
              type="submit"
              className="bg-rh-primaryblue text-white px-10 py-2 rounded hover:bg-rh-secondaryblue transition-colors"
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
                <span>Atualizar</span>
              )}
            </button>

            <button
              type="button"
              className="bg-rh-primarygrey text-white px-10 py-2 rounded hover:bg-gray-800 transition-colors"
              onClick={() => navigate("/perfil")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <img src={bgeditar2} alt="decorativo" className="sticky top-0 h-screen" />
    </div>
  );
}
